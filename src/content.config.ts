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
  }),
});

export const collections = {
  blog,
};
