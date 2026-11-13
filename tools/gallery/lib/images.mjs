/**
 * Image work for tools/gallery/photos.mjs: the web textures and depth map behind /photos/, and keeping an uploaded
 * original under the size limit.
 */
import sharp from "sharp";
import { pipeline, RawImage } from "@huggingface/transformers";

const SM = 1280;
const LG = 2560;
const DEPTH = 1024;
const DEPTH_MODEL = "onnx-community/depth-anything-v2-small";

const fit = (size) => ({ width: size, height: size, fit: "inside", withoutEnlargement: true });

let estimator;
/** Depth Anything V2 Small; downloaded once into node_modules/@huggingface/transformers/.cache. */
async function depthEstimator() {
  estimator ??= await pipeline("depth-estimation", DEPTH_MODEL, { dtype: "fp32" });
  return estimator;
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

/**
 * Everything /photos/ needs for one photo, from its full-size source:
 *   <slug>-sm.webp     1280px texture for the corridor and the grid
 *   <slug>-lg.webp     2560px for the lightbox and essays
 *   <slug>-depth.png   monocular depth map, near = white
 * plus the manifest entry that goes into src/data/gallery-assets.json.
 * Derived files carry no metadata (sharp drops it), so nothing like GPS leaks through them.
 */
export async function makeWebAssets(source, slug) {
  const oriented = await sharp(source).rotate().toBuffer();
  const { width, height } = await sharp(oriented).metadata();

  const sm = await sharp(oriented).resize(fit(SM)).webp({ quality: 80 }).toBuffer();
  const lg = await sharp(oriented).resize(fit(LG)).webp({ quality: 84 }).toBuffer();

  const rgb = await sharp(sm).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { depth } = await (await depthEstimator())(
    new RawImage(new Uint8ClampedArray(rgb.data), rgb.info.width, rgb.info.height, 3),
  );
  const grown = dilate(depth.data, depth.width, depth.height, 3);
  const depthPng = await sharp(Buffer.from(grown), { raw: { width: depth.width, height: depth.height, channels: 1 } })
    .resize(fit(DEPTH))
    .blur(1.6)
    .png({ compressionLevel: 9 })
    .toBuffer();

  const files = { sm: `${slug}-sm.webp`, lg: `${slug}-lg.webp`, depth: `${slug}-depth.png` };
  return {
    files: { [files.sm]: sm, [files.lg]: lg, [files.depth]: depthPng },
    entry: {
      width,
      height,
      ...files,
      smWidth: (await sharp(sm).metadata()).width,
      lgWidth: (await sharp(lg).metadata()).width,
      color: await moodColor(sm),
      focus: Number(median(depth.data).toFixed(3)),
    },
  };
}

/**
 * The original as it will be uploaded. Files at or under `maxBytes` go up byte for byte. Bigger ones are re-encoded
 * as JPEG, first at quality 90 and 85, then made smaller step by step until they fit. Metadata (EXIF, XMP, ICC) is
 * kept; GPS is removed afterwards by exiftool. Pixels aren't rotated, so the EXIF orientation still applies.
 */
export async function fitOriginal(source, maxBytes) {
  if (source.length <= maxBytes) {
    return { buffer: source, converted: false };
  }
  const { width, height, hasAlpha } = await sharp(source).metadata();
  const encode = (long, quality) => {
    let img = sharp(source).keepMetadata();
    if (hasAlpha) img = img.flatten({ background: "#000" });
    if (long < Math.max(width, height)) img = img.resize(fit(long));
    return img.jpeg({ quality }).toBuffer();
  };

  let long = Math.max(width, height);
  let out;
  for (const quality of [90, 85]) {
    out = await encode(long, quality);
    if (out.length <= maxBytes) return { buffer: out, converted: true, quality, long };
  }
  for (let i = 0; i < 8; i++) {
    long = Math.floor(long * Math.min(0.92, Math.sqrt(maxBytes / out.length) * 0.97));
    out = await encode(long, 85);
    if (out.length <= maxBytes) return { buffer: out, converted: true, quality: 85, long };
  }
  throw new Error(`压不到 ${maxBytes} 字节以内（最后一次 ${long}px 仍有 ${out.length} 字节）`);
}
