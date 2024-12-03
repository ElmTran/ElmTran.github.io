<script setup lang="ts">
import { useData } from "vitepress";

// https://vitepress.dev/reference/runtime-api#usedata
const { site, frontmatter } = useData();
import { withBase } from "vitepress";
import "../../style/home/index.scss";
</script>

<template>
  <div v-if="frontmatter.home" class="home">
    <div class="headings animated fadeInLeft">
      <h1 class="title">{{ site.title }}</h1>
      <h3 class="description">
        {{ site.description }}
      </h3>
      <button onclick="window.location.href='/blog/'">Get Started</button>
    </div>
  </div>
  <div v-else>
    <Content />
  </div>
</template>
