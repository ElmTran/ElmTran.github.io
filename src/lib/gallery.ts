import fs from "node:fs";
import path from "node:path";
import { galleryAssetBase, galleryPhotos, type GalleryExif } from "../site";
import { discoverPublicImages } from "./public-images";

/** Written by tools/gallery/prepare.mjs, keyed by the photo's original src. File names resolve against galleryAssetBase. */
type PreparedAssets = {
  width: number;
  height: number;
  sm: string;
  lg: string;
  depth: string;
  smWidth: number;
  lgWidth: number;
  color: string;
  focus: number;
};

export type GalleryItem = {
  src: string;
  alt: string;
  title: string;
  place?: string;
  /** YYYY-MM-DD, parsed from the caption. */
  date?: string;
  year?: string;
  exif?: GalleryExif;
  /** Intrinsic aspect ratio (w / h); 1.5 until prepared assets say otherwise. */
  aspect: number;
  /** Corridor texture (~1280px). */
  sm: string;
  /** Lightbox texture (~2560px). */
  lg: string;
  /** sm + lg with width descriptors; missing until the prep script has run. */
  srcset?: string;
  /** Depth map, near = white. Missing until the prep script has run. */
  depth?: string;
  /** Mood colour used for placeholders and scene tint. */
  color: string;
  /** Median depth: the plane that stays still in the parallax. */
  focus: number;
};

const ASSETS_FILE = path.join(process.cwd(), "src/data/gallery-assets.json");
const CAPTION = /^(\d{4}-\d{2}-\d{2})\s+(.+?)(?:,\s*([^,]+))?$/;
const ASSET_BASE = galleryAssetBase.replace(/\/?$/, "/");
const assetUrl = (file: string) => `${ASSET_BASE}${file}`;

function readPreparedAssets(): Record<string, PreparedAssets> {
  try {
    return JSON.parse(fs.readFileSync(ASSETS_FILE, "utf8"));
  } catch {
    return {};
  }
}

/** "2025-10-03 藏民转场, 四川" → date, title, place. Captions that don't match become the title as-is. */
export function parseCaption(alt: string) {
  const match = CAPTION.exec(alt.trim());
  if (!match) {
    return { title: alt.trim() };
  }
  return { date: match[1], title: match[2].trim(), place: match[3]?.trim() };
}

/** Photos for /photos/, oldest first, merged with any prepared textures and depth maps. */
export function loadGallery() {
  const fromConfig = galleryPhotos.map((p) => ({ src: p.src, alt: p.alt?.trim() || "Photo", exif: p.exif }));
  const remote = fromConfig.length > 0;
  const source = remote ? fromConfig : discoverPublicImages("images");
  const assets = readPreparedAssets();

  const items: GalleryItem[] = source
    .map((p, order) => {
      const prepared = assets[p.src];
      const caption = parseCaption(p.alt);
      const item: GalleryItem = {
        src: p.src,
        alt: p.alt,
        ...caption,
        year: caption.date?.slice(0, 4),
        exif: p.exif,
        aspect: prepared ? prepared.width / prepared.height : 1.5,
        sm: prepared ? assetUrl(prepared.sm) : p.src,
        lg: prepared ? assetUrl(prepared.lg) : p.src,
        srcset: prepared
          ? `${assetUrl(prepared.sm)} ${prepared.smWidth}w, ${assetUrl(prepared.lg)} ${prepared.lgWidth}w`
          : undefined,
        depth: prepared && assetUrl(prepared.depth),
        color: prepared?.color ?? "#3a3a3a",
        focus: prepared?.focus ?? 0.5,
      };
      return { item, order };
    })
    .sort((a, b) => (a.item.date ?? "9999").localeCompare(b.item.date ?? "9999") || a.order - b.order)
    .map(({ item }) => item);

  return { items, remote };
}
