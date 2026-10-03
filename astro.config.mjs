import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://elmtran.com",
  trailingSlash: "always",
  integrations: [sitemap()],
  redirects: {
    "/album/": "/photos/",
    "/welcome/": "/",
    "/blog/": "/essays/",
    "/blog/tags/": "/essays/tags/",
    "/blog/categories/": "/essays/categories/",
  },
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
});