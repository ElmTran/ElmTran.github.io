/**
 * Photos for /photos/, one YAML file each in content/photos/.
 *
 *   pnpm photos add <files or folders…> [--place 杭州] [--date 2022-10-31] [--dry-run]
 *     For each image (jpg / jpeg / png / webp; a folder means the images directly inside it), in this order:
 *       1. read title, city, rating and EXIF with exiftool; missing ones get the defaults below
 *       2. name it YYYYMMDD-<file> (--date, else shooting date, else file date)
 *       3. keep the original under 10 MB
 *       4. remove GPS from the copy that gets uploaded (the local file is not touched)
 *       5. make the textures and depth map
 *       6. upload everything with rclone; an existing original is never overwritten
 *       7. write content/photos/<name>.yaml and its entry in src/data/gallery-assets.json
 *     --place and --date set the place and date of every photo in the run, over what the files say (e.g. when the
 *     camera clock was wrong). Photos already added are skipped, so the same folder can be run again. --dry-run only
 *     shows the plan.
 *
 *   pnpm photos sync [--force] [--dry-run]
 *     Makes and uploads the web assets of any photo in content/photos/ that has none yet (every photo with --force),
 *     and drops manifest entries whose YAML is gone.
 *
 * Needs exiftool, rclone, and R2_BUCKET plus the r2: remote from ~/devenv/env/20-r2.sh.
 */
import fs from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import YAML from "yaml";
import { galleryAssetBase, photoOriginBase } from "../../src/site.ts";
import { checkExiftool, gpsTags, photoFields, readTags, stripGps } from "./lib/exiftool.mjs";
import { fitOriginal, makeWebAssets } from "./lib/images.mjs";
import { listFiles, remoteTarget, upload } from "./lib/remote.mjs";

// Node's fetch ignores HTTPS_PROXY unless told otherwise (the depth model and `sync` downloads need it).
http.setGlobalProxyFromEnv();

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const PHOTOS_DIR = path.join(ROOT, "content/photos");
const MANIFEST = path.join(ROOT, "src/data/gallery-assets.json");
const LOCAL_ASSETS = path.join(ROOT, "public/gallery");
const CACHE_DIR = path.join(HERE, ".cache");

const MAX_ORIGINAL = 10 * 1000 * 1000;
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const DEFAULTS = { rating: 3, title: "无题", place: "未知" };

const mb = (bytes) => `${(bytes / 1e6).toFixed(1)} MB`;
const exists = (p) =>
  fs.access(p).then(
    () => true,
    () => false,
  );

/** Where web assets live on the remote, relative to the bucket root: galleryAssetBase minus photoOriginBase. */
function assetPrefix() {
  if (!galleryAssetBase.startsWith(photoOriginBase)) {
    throw new Error(`galleryAssetBase（${galleryAssetBase}）不在 photoOriginBase（${photoOriginBase}）下面，没法上传`);
  }
  return galleryAssetBase.slice(photoOriginBase.length);
}

/** `E:\Pictures\x` → `/mnt/e/Pictures/x`, so Windows paths can be pasted as they are. */
function toLocalPath(arg) {
  const m = /^([A-Za-z]):[\\/](.*)$/.exec(arg);
  return m ? `/mnt/${m[1].toLowerCase()}/${m[2].replaceAll("\\", "/")}` : arg;
}

const localYmd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Safe in a URL and a file name: spaces and reserved characters become "-". */
const sanitize = (s) =>
  s
    .normalize("NFC")
    .replace(/[\s#?%&+/\\:*"'<>|]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");

const normExt = (ext) => (ext.toLowerCase() === ".jpeg" ? ".jpg" : ext.toLowerCase());

/** "2022-10-31", "2022/10/31" or "20221031" → "2022-10-31". Other forms, or a day that doesn't exist, are an error. */
function parseDate(value) {
  const m = /^(\d{4})[-/.]?(\d{2})[-/.]?(\d{2})$/.exec(value.trim());
  const day = m && new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (!day || day.getUTCMonth() !== Number(m[2]) - 1 || day.getUTCDate() !== Number(m[3])) {
    throw new Error(`--date 要写成 YYYY-MM-DD，比如 2022-10-31（收到的是「${value}」）`);
  }
  return `${m[1]}-${m[2]}-${m[3]}`;
}

async function readManifest() {
  try {
    return JSON.parse(await fs.readFile(MANIFEST, "utf8"));
  } catch {
    return {};
  }
}

async function writeManifest(manifest) {
  await fs.mkdir(path.dirname(MANIFEST), { recursive: true });
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
}

async function readPhotos() {
  const names = await fs.readdir(PHOTOS_DIR).catch(() => []);
  const photos = [];
  for (const name of names.filter((n) => /\.ya?ml$/i.test(n)).sort()) {
    const data = YAML.parse(await fs.readFile(path.join(PHOTOS_DIR, name), "utf8"));
    if (!data?.src) throw new Error(`content/photos/${name} 缺少 src`);
    photos.push({ name, data });
  }
  return photos;
}

function toYaml(data) {
  const doc = { src: data.src, rating: data.rating, title: data.title, place: data.place, date: data.date || "" };
  if (data.exif) doc.exif = data.exif;
  return YAML.stringify(doc, { lineWidth: 0 });
}

async function collectImages(inputs) {
  const files = new Set();
  for (const input of inputs.map(toLocalPath)) {
    const abs = path.resolve(input);
    const stat = await fs.stat(abs).catch(() => null);
    if (!stat) throw new Error(`找不到：${input}`);
    if (stat.isDirectory()) {
      for (const entry of await fs.readdir(abs, { withFileTypes: true })) {
        if (entry.isFile() && IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) {
          files.add(path.join(abs, entry.name));
        }
      }
    } else if (IMAGE_EXT.has(path.extname(abs).toLowerCase())) {
      files.add(abs);
    } else {
      console.warn(`跳过（不是 jpg / jpeg / png / webp）：${input}`);
    }
  }
  return [...files].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

/** One line of what a photo will say about itself on the site. */
function describe(data) {
  const e = data.exif ?? {};
  const exposure = [e.focalLength, e.aperture, e.shutter, e.iso && `ISO ${e.iso}`].filter(Boolean).join(" ");
  return [`★${data.rating}`, data.title, data.place, data.date || "无日期", e.camera, e.lens, exposure]
    .filter(Boolean)
    .join(" · ");
}

/** Write a photo's web assets to public/gallery (local copy) and to `dir` (staged for upload). */
async function writeAssets(files, dir) {
  await fs.mkdir(LOCAL_ASSETS, { recursive: true });
  await fs.mkdir(dir, { recursive: true });
  for (const [name, buffer] of Object.entries(files)) {
    await fs.writeFile(path.join(LOCAL_ASSETS, name), buffer);
    await fs.writeFile(path.join(dir, name), buffer);
  }
}

// ---------------------------------------------------------------- add

async function add(inputs, { dryRun, place, date }) {
  await checkExiftool();
  const images = await collectImages(inputs);
  if (images.length === 0) throw new Error("没有找到图片（支持 jpg / jpeg / png / webp）");

  const tags = await readTags(images);
  const knownSrc = new Set((await readPhotos()).map((p) => p.data.src));

  const plans = [];
  for (const file of images) {
    const fields = photoFields(tags.get(file));
    const stat = await fs.stat(file);
    const stem = path.parse(file).name;
    const shotDate = date || fields.date;
    const prefix = (shotDate || localYmd(stat.mtime)).replaceAll("-", "");
    const slug = sanitize(/^\d{8}[-_]/.test(stem) ? stem : `${prefix}-${stem}`);
    const converts = stat.size > MAX_ORIGINAL;
    const name = slug + (converts ? ".jpg" : normExt(path.extname(file)));
    const src = photoOriginBase + name;
    const yaml = path.join(PHOTOS_DIR, `${slug}.yaml`);
    plans.push({
      file,
      slug,
      name,
      src,
      yaml,
      size: stat.size,
      converts,
      done: knownSrc.has(src) || (await exists(yaml)),
      data: {
        src,
        rating: fields.rating ?? DEFAULTS.rating,
        title: fields.title || DEFAULTS.title,
        place: place || fields.place || DEFAULTS.place,
        date: shotDate,
        exif: fields.exif,
      },
    });
  }

  const bySlug = Map.groupBy(plans, (p) => p.slug);
  const clashes = [...bySlug.values()].filter((group) => group.length > 1);
  if (clashes.length) {
    const list = clashes.map((g) => `  ${g[0].slug}: ${g.map((p) => p.file).join(", ")}`).join("\n");
    throw new Error(`这些文件会得到同一个名字，请先改名再上传：\n${list}`);
  }

  const todo = plans.filter((p) => !p.done);
  let target;
  let remoteNames = new Set();
  try {
    target = remoteTarget();
    if (todo.length) remoteNames = await listFiles(target);
  } catch (err) {
    if (!dryRun) throw err;
    console.warn(`（没连上远端，不检查重名：${err.message.split("\n")[0]}）\n`);
  }

  for (const [dir, group] of Map.groupBy(plans, (p) => path.dirname(p.file))) {
    console.log(`${dir}`);
    for (const p of group) {
      if (p.done) {
        console.log(`  ${path.basename(p.file)}  已添加过（${p.name}），跳过`);
        continue;
      }
      const size = p.converts ? `${mb(p.size)} → 压缩成 10 MB 以内的 JPG` : mb(p.size);
      const clash = remoteNames.has(p.name) ? "  ⚠ R2 上已有同名文件，内容不同则不会覆盖、这张会失败" : "";
      console.log(`  ${path.basename(p.file)} → ${p.name}  ${size}${clash}`);
      console.log(`     ${describe(p.data)}`);
    }
  }
  console.log(`\n共 ${plans.length} 张：新增 ${todo.length}，跳过 ${plans.length - todo.length}`);
  if (dryRun || todo.length === 0) {
    if (dryRun && todo.length) console.log("这是预览（--dry-run），什么都没上传。去掉 --dry-run 再执行一次就会真正添加。");
    return;
  }

  const prefix = assetPrefix();
  const manifest = await readManifest();
  const stage = await fs.mkdtemp(path.join(os.tmpdir(), "photos-"));
  const failed = [];
  await fs.mkdir(PHOTOS_DIR, { recursive: true });
  console.log("");
  try {
    for (const [i, p] of todo.entries()) {
      const step = `[${i + 1}/${todo.length}]`;
      try {
        const source = await fs.readFile(p.file);
        const original = await fitOriginal(source, MAX_ORIGINAL);
        const originalDir = path.join(stage, p.slug, "original");
        const originalFile = path.join(originalDir, p.name);
        await fs.mkdir(originalDir, { recursive: true });
        await fs.writeFile(originalFile, original.buffer);
        await stripGps(originalFile);
        const left = await gpsTags(originalFile);
        if (left.length) throw new Error(`GPS 没删干净：${left.join(", ")}`);
        const uploadedSize = (await fs.stat(originalFile)).size;
        // The original goes first: a name clash on the remote fails here, before the slow depth map.
        await upload(originalDir, target, "", { immutable: true });

        const { files, entry } = await makeWebAssets(source, p.slug);
        const assetDir = path.join(stage, p.slug, "assets");
        await writeAssets(files, assetDir);
        await upload(assetDir, target, prefix);

        manifest[p.src] = entry;
        await writeManifest(manifest);
        await fs.writeFile(p.yaml, toYaml(p.data));
        const note = original.converted ? `（原文件 ${mb(p.size)}，压缩为 ${original.long}px · 品质 ${original.quality}）` : "";
        console.log(`${step} ✓ ${p.name}  ${mb(uploadedSize)}${note}`);
      } catch (err) {
        failed.push(p);
        console.error(`${step} ✗ ${p.name}\n    ${err.message.replaceAll("\n", "\n    ")}`);
      } finally {
        await fs.rm(path.join(stage, p.slug), { recursive: true, force: true });
      }
    }
  } finally {
    await fs.rm(stage, { recursive: true, force: true });
  }

  const added = todo.length - failed.length;
  console.log(`\n完成：新增 ${added} 张${failed.length ? `，失败 ${failed.length} 张（再执行一次会重试失败的）` : ""}`);
  if (added) {
    console.log("接下来：在 content/photos/ 里补标题、地点、日期，给要进 3D 的照片打 5 星，然后提交");
    console.log("  git add content/photos src/data/gallery-assets.json");
  }
  if (failed.length) process.exitCode = 1;
}

// ---------------------------------------------------------------- sync

const complete = (entry) => Boolean(entry?.sm && entry?.lg && entry?.depth);

async function loadSource(src) {
  if (!/^https?:/i.test(src)) {
    return fs.readFile(path.join(ROOT, "public", src));
  }
  const cached = path.join(CACHE_DIR, decodeURIComponent(path.basename(new URL(src).pathname)));
  if (await exists(cached)) return fs.readFile(cached);
  const res = await fetch(src);
  if (!res.ok) throw new Error(`下载 ${src} 失败：HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(cached, buffer);
  return buffer;
}

async function sync({ dryRun, force }) {
  const photos = await readPhotos();
  const manifest = await readManifest();
  const todo = photos.filter((p) => force || !complete(manifest[p.data.src]));
  const known = new Set(photos.map((p) => p.data.src));
  const stale = Object.keys(manifest).filter((src) => !known.has(src));

  for (const p of todo) console.log(`  生成并上传：${p.name}`);
  for (const src of stale) console.log(`  从 gallery-assets.json 删除（YAML 已不在）：${src}`);
  console.log(`共 ${photos.length} 张：要生成 ${todo.length}，要删除记录 ${stale.length}`);
  if (dryRun || (todo.length === 0 && stale.length === 0)) return;

  const failed = [];
  if (todo.length) {
    const target = remoteTarget();
    const prefix = assetPrefix();
    const stage = await fs.mkdtemp(path.join(os.tmpdir(), "photos-"));
    try {
      for (const [i, p] of todo.entries()) {
        const step = `[${i + 1}/${todo.length}]`;
        try {
          const slug = path.parse(new URL(p.data.src, "https://local.invalid").pathname).name;
          const { files, entry } = await makeWebAssets(await loadSource(p.data.src), decodeURIComponent(slug));
          const assetDir = path.join(stage, slug);
          await writeAssets(files, assetDir);
          await upload(assetDir, target, prefix);
          manifest[p.data.src] = entry;
          await writeManifest(manifest);
          console.log(`${step} ✓ ${p.name}`);
        } catch (err) {
          failed.push(p);
          console.error(`${step} ✗ ${p.name}\n    ${err.message.replaceAll("\n", "\n    ")}`);
        }
      }
    } finally {
      await fs.rm(stage, { recursive: true, force: true });
    }
  }
  for (const src of stale) delete manifest[src];
  await writeManifest(manifest);

  if (force && todo.length) {
    console.log("提示：同名文件被覆盖后，CDN 可能还缓存着旧版本，需要时在 Cloudflare → Caching → Purge 清掉。");
  }
  if (failed.length) process.exitCode = 1;
}

// ---------------------------------------------------------------- main

const USAGE = `用法：
  pnpm photos add <文件或文件夹…> [--place 地点] [--date YYYY-MM-DD] [--dry-run]
  pnpm photos sync [--force] [--dry-run]`;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    "dry-run": { type: "boolean", default: false },
    force: { type: "boolean", default: false },
    place: { type: "string" },
    date: { type: "string" },
    help: { type: "boolean", short: "h", default: false },
  },
});
const [command, ...inputs] = positionals;

try {
  const options = {
    dryRun: values["dry-run"],
    force: values.force,
    place: values.place?.trim(),
    date: values.date === undefined ? undefined : parseDate(values.date),
  };
  if (values.help) {
    console.log(USAGE);
  } else if (command === "add" && inputs.length) {
    await add(inputs, options);
  } else if (command === "sync" && inputs.length === 0) {
    await sync(options);
  } else {
    console.error(USAGE);
    process.exitCode = 2;
  }
} catch (err) {
  console.error(`出错：${err.message}`);
  process.exitCode = 1;
}
