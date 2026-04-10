import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://elmtran.github.io",
  trailingSlash: "always",
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
