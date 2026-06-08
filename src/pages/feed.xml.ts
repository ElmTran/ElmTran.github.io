import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { getPostDate, getPostUrl, sortPosts } from "../lib/posts";
import { siteMeta } from "../site";

export async function GET({ site }: APIContext) {
  const baseUrl = site ?? new URL("https://elmtran.com");
  const posts = sortPosts(await getCollection("blog"));
  const latestPostDate = posts[0] ? getPostDate(posts[0]) : new Date();
  const feedUrl = new URL("/feed.xml", baseUrl).toString();
  const siteUrl = new URL("/", baseUrl).toString();

  const items = posts
    .map((post) => {
      const postUrl = new URL(getPostUrl(post), baseUrl).toString();
      const categories = [...post.data.categories, ...post.data.tags]
        .map((category) => `<category>${escapeXml(category)}</category>`)
        .join("");

      return [
        "<item>",
        `<title>${escapeXml(post.data.title)}</title>`,
        `<link>${postUrl}</link>`,
        `<guid isPermaLink="true">${postUrl}</guid>`,
        `<pubDate>${getPostDate(post).toUTCString()}</pubDate>`,
        post.data.description ? `<description>${escapeXml(post.data.description)}</description>` : "",
        categories,
        "</item>",
      ].join("");
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteMeta.title)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteMeta.description)}</description>
    <language>en</language>
    <lastBuildDate>${latestPostDate.toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>
`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
