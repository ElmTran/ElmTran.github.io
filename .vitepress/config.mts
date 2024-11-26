import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Mengqing's Blog",
  description:
    "Your hair is winter fire,\n\nJanuary embers,\n\nMy heart burns there, too.",
  srcDir: "docs",
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
  },
});
