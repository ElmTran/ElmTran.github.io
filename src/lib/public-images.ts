import fs from "node:fs";
import path from "node:path";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".bmp", ".svg"]);

export type PublicImage = {
  src: string;
  alt: string;
};

/**
 * 构建时扫描 public 子目录下的图片文件（默认 public/images），免去手写列表。
 * 排序：按文件名字母顺序（数字友好）。
 */
export function discoverPublicImages(relativeDir = "images"): PublicImage[] {
  const clean = relativeDir.replace(/^\/+|\/+$/g, "");
  const abs = path.join(process.cwd(), "public", clean);

  if (!fs.existsSync(abs)) {
    return [];
  }

  return fs
    .readdirSync(abs, { withFileTypes: true })
    .filter((e) => e.isFile() && IMAGE_EXT.has(path.extname(e.name).toLowerCase()))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
    .map((name) => ({
      src: `/${clean}/${name}`.replace(/\/{2,}/g, "/"),
      alt: humanizeAlt(name),
    }));
}

function humanizeAlt(filename: string) {
  const base = path.parse(filename).name;
  const words = base.replace(/[-_]+/g, " ").trim();
  return words || "Photo";
}
