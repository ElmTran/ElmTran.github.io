/**
 * Offline asset prep for the 3D /photos/ page.
 *
 * For every entry in `galleryPhotos` (src/site.ts) this writes to public/gallery/:
 *   <name>-sm.webp     1280px texture for the corridor
 *   <name>-lg.webp     2560px texture for the lightbox
 *   <name>-depth.png   monocular depth map (Depth Anything V2 Small, near = white)
 * and records file names, size, mood colour and focal depth in src/data/gallery-assets.json.
 * The site resolves those names against `galleryAssetBase` in src/site.ts.
 *
 * Usage (from repo root):
 *   ONNXRUNTIME_NODE_INSTALL=skip npm --prefix tools/gallery install
 *   npm --prefix tools/gallery run prepare-assets            # only new photos
 *   npm --prefix tools/gallery run prepare-assets -- --force # rebuild everything
 */
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { pipeline, RawImage } from "@huggingface/transformers";
import { galleryPhotos } from "../../src/site.ts";

// Node's fetch ignores HTTPS_PROXY unless told otherwise.
http.setGlobalProxyFromEnv();

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const OUT_DIR = path.join(ROOT, "public/gallery");
const MANIFEST = path.join(ROOT, "src/data/gallery-assets.json");
const CACHE_DIR = path.join(HERE, ".cache");

const SM = 1280;
const LG = 2560;
const DEPTH = 1024;
const DEPTH_MODEL = "onnx-community/depth-anything-v2-small";

const force = process.argv.includes("--force");

const exists = (p) =>
  fs.access(p).then(
    () => true,
    () => false,
  );

async function readManifest() {
  try {
    return JSON.parse(await fs.readFile(MANIFEST, "utf8"));
  } catch {
    return {};
  }
}

async function loadSource(src) {
  const name = path.basename(new URL(src, "https://local.invalid").pathname);
  if (!/^https?:/i.test(src)) {
    return { name, buffer: await fs.readFile(path.join(ROOT, "public", src)) };
  }
  const cached = path.join(CACHE_DIR, name);
  if (await exists(cached)) {
    return { name, buffer: await fs.readFile(cached) };
  }
  const res = await fetch(src);
  if (!res.ok) {
    throw new Error(`GET ${src} → ${res.status}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(cached, buffer);
  return { name, buffer };
}

/** Grow near (bright) regions by `radius` px so parallax drags a little background with the subject instead of tearing it. */
function dilate(data, width, height, radius) {
  const tmp = new Uint8Array(data.length);
  const out = new Uint8Array(data.length);
  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      let m = 0;
      for (let k = Math.max(0, x - radius); k <= Math.min(width - 1, x + radius); k++) {
        m = Math.max(m, data[row + k]);
      }
      tmp[row + x] = m;
    }
  }
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let m = 0;
      for (let k = Math.max(0, y - radius); k <= Math.min(height - 1, y + radius); k++) {
        m = Math.max(m, tmp[k * width + x]);
      }
      out[y * width + x] = m;
    }
  }
  return out;
}

function median(data) {
  const hist = new Uint32Array(256);
  for (const v of data) hist[v]++;
  let acc = 0;
  for (let i = 0; i < 256; i++) {
    acc += hist[i];
    if (acc >= data.length / 2) return i / 255;
  }
  return 0.5;
}

const toHex = ({ r, g, b }) => "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");

/** Saturation-weighted mean colour: picks up the mood of the frame instead of its (usually dark) largest area. */
async function moodColor(buffer) {
  const { data } = await sharp(buffer).resize(48, 48, { fit: "inside" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let r = 0, g = 0, b = 0, total = 0;
  for (let i = 0; i < data.length; i += 3) {
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    const w = ((max - min) / 255) ** 2 * (max / 255) + 0.01;
    r += data[i] * w;
    g += data[i + 1] * w;
    b += data[i + 2] * w;
    total += w;
  }
  return toHex({ r: Math.round(r / total), g: Math.round(g / total), b: Math.round(b / total) });
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(path.dirname(MANIFEST), { recursive: true });
  const manifest = await readManifest();
  let estimator;

  for (const photo of galleryPhotos) {
    const { name, buffer } = await loadSource(photo.src);
    const slug = path.parse(name).name;
    const files = {
      sm: `${slug}-sm.webp`,
      lg: `${slug}-lg.webp`,
      depth: `${slug}-depth.png`,
    };
    const done =
      manifest[photo.src] &&
      (await Promise.all(Object.values(files).map((f) => exists(path.join(OUT_DIR, f))))).every(Boolean);
    if (done && !force) {
      console.log(`skip  ${slug}`);
      continue;
    }

    const oriented = await sharp(buffer).rotate().toBuffer();
    const { width, height } = await sharp(oriented).metadata();
    const fit = (size) => ({ width: size, height: size, fit: "inside", withoutEnlargement: true });

    const smBuffer = await sharp(oriented).resize(fit(SM)).webp({ quality: 80 }).toBuffer();
    await fs.writeFile(path.join(OUT_DIR, files.sm), smBuffer);
    const lgBuffer = await sharp(oriented).resize(fit(LG)).webp({ quality: 84 }).toBuffer();
    await fs.writeFile(path.join(OUT_DIR, files.lg), lgBuffer);

    estimator ??= await pipeline("depth-estimation", DEPTH_MODEL, { dtype: "fp32" });
    const rgb = await sharp(smBuffer).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const { depth } = await estimator(new RawImage(new Uint8ClampedArray(rgb.data), rgb.info.width, rgb.info.height, 3));
    const grown = dilate(depth.data, depth.width, depth.height, 3);
    await sharp(Buffer.from(grown), { raw: { width: depth.width, height: depth.height, channels: 1 } })
      .resize(fit(DEPTH))
      .blur(1.6)
      .png({ compressionLevel: 9 })
      .toFile(path.join(OUT_DIR, files.depth));

    manifest[photo.src] = {
      width,
      height,
      ...files,
      smWidth: (await sharp(smBuffer).metadata()).width,
      lgWidth: (await sharp(lgBuffer).metadata()).width,
      color: await moodColor(smBuffer),
      focus: Number(median(depth.data).toFixed(3)),
    };
    console.log(`done  ${slug}  ${width}×${height}  ${manifest[photo.src].color}`);
  }

  const known = new Set(galleryPhotos.map((p) => p.src));
  for (const key of Object.keys(manifest)) {
    if (!known.has(key)) delete manifest[key];
  }
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`manifest → ${path.relative(ROOT, MANIFEST)} (${Object.keys(manifest).length} photos)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
