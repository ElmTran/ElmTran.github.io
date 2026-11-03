import type { CollectionEntry } from "astro:content";

export type BlogEntry = CollectionEntry<"blog">;

export function getLegacySlug(post: BlogEntry) {
  return post.id.replace(/\.md$/i, "");
}

export function getPostSlug(post: BlogEntry) {
  return normalizeStem(getLegacySlug(post));
}

export function getPostUrl(post: BlogEntry) {
  return `/essays/${getPostSlug(post)}/`;
}

export function getLegacyUrl(post: BlogEntry) {
  return `/blog/_posts/${getLegacySlug(post)}/`;
}

export function getPostDate(post: BlogEntry) {
  return parseDate(post.data.date);
}

export function sortPosts(posts: BlogEntry[]) {
  return [...posts].sort((a, b) => getPostDate(b).getTime() - getPostDate(a).getTime());
}

function parseDate(value: string) {
  const normalized = value.replace(/\./g, "-").replace(/\//g, "-");
  const [year = "1970", month = "1", day = "1"] = normalized.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function normalizeStem(value: string) {
  return slugify(
    value
      .replace(/^\d{4}-\d{1,2}-\d{1,2}[.-]?/, "")
      .replace(/^\d{4}\.\d{1,2}\.\d{1,2}[.-]?/, ""),
  );
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[._\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
