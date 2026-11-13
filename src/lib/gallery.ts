import fs from "node:fs";
import path from "node:path";
import { getCollection, type CollectionEntry } from "astro:content";
import { galleryAssetBase, galleryFeaturedRating } from "../site";

/** Written by tools/gallery/photos.mjs, keyed by the photo's src. File names resolve against galleryAssetBase. */
type PreparedAssets = {
  width: number;
  height: number;
  sm: string;
  lg: string;
  depth?: string;
  smWidth: number;
  lgWidth: number;
  color: string;
  focus: number;
};

export type GalleryExif = NonNullable<CollectionEntry<"photos">["data"]["exif"]>;

export type GalleryItem = {
  src: string;
  /** "2025-10-03 藏民转场, 四川": image alt text, and the caption under a photo in an essay. */
  alt: string;
  title: string;
  place?: string;
  /** YYYY-MM-DD. */
  date?: string;
  year?: string;
  exif?: GalleryExif;
  /** 1–5, from the photo's YAML. */
  rating: number;
  /** Rated galleryFeaturedRating or more: walks the 3D corridor. Every photo is in the grid. */
  featured: boolean;
  /** Intrinsic aspect ratio (w / h); 1.5 until prepared assets say otherwise. */
  aspect: number;
  /** Corridor texture and grid tile (~1280px). */
  sm: string;
  /** Lightbox and essays (~2560px). */
  lg: string;
  /** sm + lg with width descriptors; missing until the photo's assets exist. */
  srcset?: string;
  /** Depth map, near = white. Missing until the photo's assets exist. */
  depth?: string;
  /** Mood colour used for placeholders and scene tint. */
  color: string;
  /** Median depth: the plane that stays still in the parallax. */
  focus: number;
};

const ASSETS_FILE = path.join(process.cwd(), "src/data/gallery-assets.json");
const ASSET_BASE = galleryAssetBase.replace(/\/?$/, "/");
const assetUrl = (file: string) => `${ASSET_BASE}${file}`;

function readPreparedAssets(): Record<string, PreparedAssets> {
  try {
    return JSON.parse(fs.readFileSync(ASSETS_FILE, "utf8"));
  } catch {
    return {};
  }
}

/** Every photo in content/photos, oldest first (same day: by file name, i.e. shooting order), with its web assets. */
export async function loadGallery() {
  const photos = await getCollection("photos");
  const assets = readPreparedAssets();

  const items: GalleryItem[] = photos.map(({ data }) => {
    const prepared = assets[data.src];
    const title = data.title ?? "无题";
    return {
      src: data.src,
      alt: [data.date, data.place ? `${title}, ${data.place}` : title].filter(Boolean).join(" "),
      title,
      place: data.place,
      date: data.date,
      year: data.date?.slice(0, 4),
      exif: data.exif ?? undefined,
      rating: data.rating,
      featured: data.rating >= galleryFeaturedRating,
      aspect: prepared ? prepared.width / prepared.height : 1.5,
      sm: prepared ? assetUrl(prepared.sm) : data.src,
      lg: prepared ? assetUrl(prepared.lg) : data.src,
      srcset: prepared
        ? `${assetUrl(prepared.sm)} ${prepared.smWidth}w, ${assetUrl(prepared.lg)} ${prepared.lgWidth}w`
        : undefined,
      depth: prepared?.depth && assetUrl(prepared.depth),
      color: prepared?.color ?? "#3a3a3a",
      focus: prepared?.focus ?? 0.5,
    };
  });

  items.sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999") || a.src.localeCompare(b.src));
  return { items, featured: items.filter((item) => item.featured) };
}
