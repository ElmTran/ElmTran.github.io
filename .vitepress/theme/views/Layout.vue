<script setup lang="ts">
import { useData } from "vitepress";
import Home from "./Home/index.vue";
import Post from "./Blog/post.vue";
// https://vitepress.dev/reference/runtime-api#usedata
const { site, frontmatter } = useData();
import "../style/common/index.scss";
</script>

<template>
  <div v-if="frontmatter.layout === 'home'" class="layout-home">
    <Home />
  </div>
  <div v-else-if="frontmatter.layout === 'post'" class="layout-post">
    <Post />
  </div>
  <div v-else class="layout-content">
    <Content />
  </div>
</template>
