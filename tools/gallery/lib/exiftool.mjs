/** exiftool for tools/gallery/photos.mjs: read what a photo knows about itself, and remove where it was taken. */
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const OPTS = { maxBuffer: 64 * 1024 * 1024 };

export async function checkExiftool() {
  try {
    await run("exiftool", ["-ver"]);
  } catch {
    throw new Error("找不到 exiftool，先安装：sudo apt install libimage-exiftool-perl");
  }
}

// `#` = the raw number instead of exiftool's printed form, where we format it ourselves.
const TAGS = [
  "Make", "Model", "LensModel", "Lens", "FocalLength#", "FNumber#", "ExposureTime", "ISO#",
  "ExposureCompensation#", "Flash#", "DateTimeOriginal", "CreateDate",
  "Rating#", "Title", "ObjectName", "XPTitle", "City",
];

/** Raw tags for many files in one exiftool run, keyed by path. */
export async function readTags(files) {
  if (files.length === 0) return new Map();
  const { stdout } = await run("exiftool", ["-j", "-q", "-q", ...TAGS.map((t) => `-${t}`), ...files], OPTS);
  return new Map(JSON.parse(stdout).map((row) => [row.SourceFile, row]));
}

const str = (v) => (v === undefined || v === null ? "" : String(v).trim());
const round = (n, digits) => Number(n.toFixed(digits));

/** "2026:10:06 08:54:07" → "2026-10-06"; empty or zeroed dates → "". */
function ymd(value) {
  const m = /^(\d{4})[:-](\d{2})[:-](\d{2})/.exec(str(value));
  return m && m[1] !== "0000" ? `${m[1]}-${m[2]}-${m[3]}` : "";
}

/**
 * The fields a content/photos/*.yaml file keeps, from raw tags. Anything missing is left out (or empty) here; the
 * caller fills in the defaults.
 */
export function photoFields(tags = {}) {
  const exif = {};
  const camera = [str(tags.Make), str(tags.Model)].filter(Boolean);
  // Model often repeats the make ("Canon EOS R5"); don't say it twice.
  if (camera.length === 2 && camera[1].toLowerCase().startsWith(camera[0].toLowerCase())) camera.shift();
  if (camera.length) exif.camera = camera.join(" ");
  const lens = str(tags.LensModel) || str(tags.Lens);
  if (lens) exif.lens = lens;
  if (typeof tags.FocalLength === "number") exif.focalLength = `${round(tags.FocalLength, 1)} mm`;
  if (typeof tags.FNumber === "number") exif.aperture = `f/${round(tags.FNumber, 1)}`;
  if (str(tags.ExposureTime)) exif.shutter = `${str(tags.ExposureTime)} sec`;
  if (typeof tags.ISO === "number") exif.iso = String(tags.ISO);
  if (typeof tags.ExposureCompensation === "number") {
    const ev = round(tags.ExposureCompensation, 1);
    exif.exposureComp = ev > 0 ? `+${ev}` : String(ev);
  }
  // Bit 0 = fired. "No flash…" is what the lightbox hides.
  if (typeof tags.Flash === "number") exif.flash = tags.Flash & 1 ? "Fired" : "No flash";

  const rating = Number.isInteger(tags.Rating) && tags.Rating >= 1 && tags.Rating <= 5 ? tags.Rating : undefined;
  return {
    rating,
    title: str(tags.Title) || str(tags.ObjectName) || str(tags.XPTitle),
    place: str(tags.City),
    date: ymd(tags.DateTimeOriginal) || ymd(tags.CreateDate),
    exif: Object.keys(exif).length ? exif : undefined,
  };
}

/** Delete every GPS tag, EXIF and XMP alike, in place. Everything else stays. */
export async function stripGps(file) {
  await run("exiftool", ["-q", "-q", "-overwrite_original", "-gps:all=", "-xmp:geotag=", file], OPTS);
}

/** Names of any GPS tags still in the file, with their group ("GPS:GPSLatitude", "XMP-exif:GPSLatitude"). */
export async function gpsTags(file) {
  const { stdout } = await run("exiftool", ["-j", "-q", "-q", "-G1", "-a", "-gps:all", "-xmp:gps*", file], OPTS);
  const [row = {}] = JSON.parse(stdout || "[]");
  return Object.keys(row).filter((k) => k !== "SourceFile");
}
