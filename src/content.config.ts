import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({
    base: "./content/blog",
    pattern: "*.md",
  }),
  schema: z.object({
    layout: z.string().optional(),
    title: z.string(),
    description: z.string().default(""),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    date: z.string(),
    /** Writing only: an `essayChapters` id from src/site.ts. Missing or unknown → the last chapter. */
    chapter: z.string().optional(),
    /** Writing only: where the story happens, shown above the title. */
    place: z.string().optional(),
    /** Writing only: the one line kept from the piece. The default /essays/ view shows each piece by it. */
    line: z.string().optional(),
    /** Photo above the title: a content/photos src (shown at lightbox size, with its caption and EXIF) or any image URL. */
    photo: z.string().optional(),
    /** Posts with the same series name are linked to each other; in Notes they fold into one row. */
    series: z.string().optional(),
  }),
});

/** Text that may also be written as a bare number in YAML (`iso: 100`). Empty values count as missing. */
const text = z
  .union([z.string(), z.number()])
  .nullish()
  .transform((v) => (v === null || v === undefined || String(v).trim() === "" ? undefined : String(v).trim()));

/**
 * One photo per YAML file in content/photos/: written by `pnpm photos add`, then edited by hand.
 * Web textures and depth maps live in src/data/gallery-assets.json, keyed by `src`.
 */
const photos = defineCollection({
  loader: glob({
    base: "./content/photos",
    pattern: "*.{yaml,yml}",
  }),
  schema: z.object({
    src: z.string(),
    /** 1–5. `galleryFeaturedRating` (src/site.ts) and up are in the 3D corridor; every photo is in the grid. */
    rating: z.number().int().min(1).max(5).default(3),
    title: text,
    place: text,
    /** YYYY-MM-DD. Unquoted, YAML reads it as a Date; both forms end up as the same string. */
    date: z
      .union([z.string(), z.date()])
      .nullish()
      .transform((d) => (d instanceof Date ? d.toISOString().slice(0, 10) : d?.trim() || undefined))
      .refine((d) => d === undefined || /^\d{4}-\d{2}-\d{2}$/.test(d), "date must be YYYY-MM-DD"),
    exif: z
      .object({
        camera: text,
        lens: text,
        focalLength: text,
        aperture: text,
        shutter: text,
        iso: text,
        exposureComp: text,
        flash: text,
      })
      .nullish(),
  }),
});

export const collections = {
  blog,
  photos,
};
