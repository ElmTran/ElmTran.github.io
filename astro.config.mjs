import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import rehypePhotos from "./src/lib/rehype-photos.ts";

export default defineConfig({
  site: "https://elmtran.com",
  trailingSlash: "always",
  integrations: [sitemap()],
  redirects: {
    "/album/": "/photos/",
    "/welcome/": "/",
    "/blog/": "/essays/",
    "/blog/tags/": "/essays/",
    "/essays/tags/": "/essays/",
    "/blog/categories/": "/essays/",
    "/essays/categories/": "/essays/",
  },
  markdown: {
    rehypePlugins: [rehypePhotos],
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
});