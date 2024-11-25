<script setup lang="ts">
import { useData } from "vitepress";

// https://vitepress.dev/reference/runtime-api#usedata
const { site, frontmatter } = useData();
</script>

<template>
  <h1>{{ site.title }}</h1>
  <p>{{ site.description }}</p>
</template>
