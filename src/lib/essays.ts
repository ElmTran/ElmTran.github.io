/**
 * /essays/ has two halves. Writing (categories writing / reflection) is for reading: grouped into the chapters in
 * `essayChapters`, each piece also known by its one kept line. Notes (everything else) are for looking up.
 */
import { getCollection } from "astro:content";
import { essayChapters, galleryPhotos, type GalleryPhoto } from "../site";
import { getPostDate, sortPosts, type BlogEntry } from "./posts";

export type EssayChapter = (typeof essayChapters)[number];

export const noteCategories = [
  { id: "technology", label: "Tech" },
  { id: "markets", label: "Markets" },
  { id: "resources", label: "Resources" },
  { id: "interview", label: "Interview" },
];

export type NoteItem = { kind: "post"; post: BlogEntry } | { kind: "series"; title: string; posts: BlogEntry[] };

export function isWriting(post: BlogEntry) {
  return post.data.categories.some((c) => c === "writing" || c === "reflection");
}

export function chapterOf(post: BlogEntry): EssayChapter {
  return essayChapters.find((c) => c.id === post.data.chapter) ?? essayChapters[essayChapters.length - 1];
}

export function noteCategoryOf(post: BlogEntry) {
  return noteCategories.find((c) => post.data.categories.includes(c.id)) ?? noteCategories[0];
}

/** The line a piece is known by; falls back to its description until one is chosen. */
export function keptLine(post: BlogEntry) {
  return post.data.line || post.data.description || post.data.title;
}

/** Split after 。？！ (and a closing quote) so each sentence can sit on its own line, as in the posts. */
export function sentences(line: string) {
  return line.split(/(?<=[。？！]”?)(?!”)/).filter(Boolean);
}

export function postPhoto(post: BlogEntry): GalleryPhoto | undefined {
  const src = post.data.photo;
  return src ? (galleryPhotos.find((p) => p.src === src) ?? { src }) : undefined;
}

export function photoExifLine(photo: GalleryPhoto) {
  const e = photo.exif;
  return e ? [e.focalLength, e.aperture, e.shutter, e.iso && `ISO ${e.iso}`].filter(Boolean).join("  ") : "";
}

export function dotDate(post: BlogEntry) {
  const d = getPostDate(post);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function hasChinese(text: string) {
  return /[一-鿿]/.test(text);
}

function plainBody(post: BlogEntry) {
  return (post.body ?? "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "");
}

/** 字数: CJK characters and punctuation, plus Latin words. */
export function charCount(post: BlogEntry) {
  const text = plainBody(post);
  const cjk = text.match(/[　-〿一-鿿＀-￯“”‘’…—]/g)?.length ?? 0;
  const words = text.replace(/[　-〿一-鿿＀-￯]/g, " ").match(/[A-Za-z0-9]+/g)?.length ?? 0;
  return cjk + words;
}

/** The first paragraphs as plain text, for the 开卷 preview. */
export function openingParagraphs(post: BlogEntry, max = 14) {
  return plainBody(post)
    .split(/\n\s*\n/)
    .map((p) =>
      p
        .replace(/^#+\s*/gm, "")
        .replace(/[*_`>]/g, "")
        .replace(/\s*\n\s*/g, " ")
        .trim(),
    )
    .filter(Boolean)
    .slice(0, max);
}

export function searchBlob(post: BlogEntry) {
  const { title, description, line, place, series, tags, categories } = post.data;
  return [title, description, line, place, series, ...tags, ...categories].filter(Boolean).join(" ").toLowerCase();
}

/** Posts in a series, in order: by date, then by title (numbered parts share a date). */
export function seriesOf(post: BlogEntry, posts: BlogEntry[]) {
  const name = post.data.series;
  if (!name) return [];
  return posts
    .filter((p) => p.data.series === name)
    .sort(
      (a, b) =>
        getPostDate(a).getTime() - getPostDate(b).getTime() ||
        a.data.title.localeCompare(b.data.title, "en", { numeric: true }),
    );
}

export async function loadEssays() {
  const posts = sortPosts(await getCollection("blog"));
  const writing = posts.filter(isWriting);
  const notes = posts.filter((p) => !isWriting(p));

  const oldestFirst = [...writing].reverse();
  const chapters = essayChapters.map((chapter) => ({
    ...chapter,
    posts: oldestFirst.filter((p) => chapterOf(p) === chapter),
  }));

  // Notes in a series fold into one row, placed where its newest part would be.
  const noteYears = new Map<string, NoteItem[]>();
  const seen = new Set<string>();
  for (const post of notes) {
    const name = post.data.series;
    if (name && seen.has(name)) continue;
    if (name) seen.add(name);
    const item: NoteItem = name ? { kind: "series", title: name, posts: seriesOf(post, notes) } : { kind: "post", post };
    const year = String(getPostDate(post).getFullYear());
    noteYears.set(year, [...(noteYears.get(year) ?? []), item]);
  }

  return {
    posts,
    writing,
    chapters,
    /** Reading order for previous / next: chapter by chapter. */
    readingOrder: chapters.flatMap((c) => c.posts),
    notes,
    noteYears,
  };
}
