<script setup lang="ts">
import { useData } from "vitepress";
import Home from "./Home/index.vue";
import Post from "./Blog/post.vue";
import About from "./Blog/about.vue";
import { onMounted } from "vue";

const { site, frontmatter } = useData();

onMounted(() => {
  document.documentElement.setAttribute("data-mounted", "true");
});

import "../style/common/index.scss";
</script>

<template>
  <div v-if="frontmatter.layout === 'home'" class="layout-home">
    <Home />
  </div>
  <div v-else-if="frontmatter.layout === 'post'" class="layout-post">
    <Post />
  </div>
  <div v-else-if="frontmatter.layout === 'about'" class="layout-about">
    <About />
  </div>
  <div v-else class="layout-content">
    <Content />
  </div>
</template>
