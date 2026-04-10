import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({
    base: "./docs/blog/_posts",
    pattern: "*.md",
  }),
  schema: z.object({
    layout: z.string().optional(),
    title: z.string(),
    description: z.string().default(""),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    date: z.string(),
  }),
});

const pages = defineCollection({
  loader: glob({
    base: "./docs",
    pattern: "{about.md,album/index.md}",
  }),
  schema: z.object({
    title: z.string(),
    layout: z.string().optional(),
  }),
});

export const collections = {
  blog,
  pages,
};
