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
    /** Photo above the title: a galleryPhotos src (adds its caption and EXIF) or any image URL. */
    photo: z.string().optional(),
    /** Posts with the same series name are linked to each other; in Notes they fold into one row. */
    series: z.string().optional(),
  }),
});

export const collections = {
  blog,
};
