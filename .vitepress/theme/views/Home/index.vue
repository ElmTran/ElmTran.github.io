<script setup lang="ts">
import "../../style/home/index.scss";
import { useData } from "vitepress";

const { site } = useData();
</script>

<template>
  <div class="home">
    <div class="headings animated fadeInLeft">
      <h1 class="title">{{ site.title }}</h1>
      <h3 class="description">
        {{ site.description }}
      </h3>
      <button onclick="window.location.href='/blog/'">Get Started</button>
    </div>
  </div>
</template>
