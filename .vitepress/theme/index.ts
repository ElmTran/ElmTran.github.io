// https://vitepress.dev/guide/custom-theme
import type { Theme } from "vitepress";
import Layout from "./views/Layout.vue";
export default {
  Layout: Layout,
  enhanceApp({ app, router, siteData }) {
    // ...
  },
} satisfies Theme;
