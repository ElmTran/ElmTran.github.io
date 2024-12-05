import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Mengqing's Blog",
  description:
    "Your hair is winter fire,\n\nJanuary embers,\n\nMy heart burns there, too.",
  srcDir: "docs",
  themeConfig: {
    socialLinks: [
      {
        icon: "🐙",
        link: "https://github.com/ElmTran",
        ariaLabel: "GitHub",
      },
      {
        icon: "📸",
        link: "https://www.instagram.com/elmtran/",
        ariaLabel: "Instagram",
      },
      {
        icon: "💼",
        link: "https://www.linkedin.com/in/elmtran/",
        ariaLabel: "LinkedIn",
      },
      {
        icon: "✈️",
        link: "https://t.me/mzfbwu/",
        ariaLabel: "Telegram",
      },
    ],
    footer: {
      message: "Train hard, turn up, run your best.",
      copyright: "© 2024 Mengqing",
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
  },
  markdown: {
    image: {
      // 开启图片懒加载
      lazyLoading: true,
    },
    lineNumbers: true,
    theme: "material-theme-palenight",
  },
  ignoreDeadLinks: true,
});
