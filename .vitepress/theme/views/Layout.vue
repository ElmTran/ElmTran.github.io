<script setup lang="ts">
import { useData } from "vitepress";
import Home from "./Home/index.vue";
// https://vitepress.dev/reference/runtime-api#usedata
const { site, frontmatter } = useData();
import "../style/common/index.scss";
</script>

<template>
  <div v-if="frontmatter.home" class="layout-home">
    <Home />
  </div>
  <div v-else class="layout-content">
    <Content />
  </div>
</template>
