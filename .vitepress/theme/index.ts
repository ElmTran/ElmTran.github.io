// https://vitepress.dev/guide/custom-theme
import type { Theme } from "vitepress";
import { h } from "vue";
import Home from "./views/Home/index.vue";
import "./style.css";
export default {
  Layout: () => {
    return h(Home, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  },
  enhanceApp({ app, router, siteData }) {
    // ...
  },
} satisfies Theme;
