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

export function formatPostDate(post: BlogEntry) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(getPostDate(post));
}

export function sortPosts(posts: BlogEntry[]) {
  return [...posts].sort((a, b) => getPostDate(b).getTime() - getPostDate(a).getTime());
}

export function groupPostsByYear(posts: BlogEntry[]) {
  return sortPosts(posts).reduce(
    (groups, post) => {
      const year = String(getPostDate(post).getFullYear());
      const bucket = groups.get(year) ?? [];
      bucket.push(post);
      groups.set(year, bucket);
      return groups;
    },
    new Map<string, BlogEntry[]>(),
  );
}

export function getPostSearchBlob(post: BlogEntry) {
  return [post.data.title, post.data.description, ...post.data.tags, ...post.data.categories]
    .filter((s): s is string => Boolean(s && String(s).trim()))
    .join(" ")
    .toLowerCase();
}

export function collectTaxonomy(posts: BlogEntry[], key: "categories" | "tags") {
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const item of post.data[key]) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count, slug: slugify(name) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getRelatedPosts(posts: BlogEntry[], current: BlogEntry, limit = 3) {
  const currentCategories = new Set(current.data.categories);
  const currentTags = new Set(current.data.tags);

  return sortPosts(
    posts.filter((post) => {
      if (post.id === current.id) {
        return false;
      }

      return (
        post.data.categories.some((item) => currentCategories.has(item)) ||
        post.data.tags.some((item) => currentTags.has(item))
      );
    }),
  ).slice(0, limit);
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
