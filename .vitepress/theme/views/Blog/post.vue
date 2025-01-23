<script setup lang="ts">
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import Title from "./components/Title.vue";
import TableOfContents from "./components/TableOfContents.vue";
</script>

<template>
  <div class="blog-container">
    <Header />
    <div class="post-content">
      <Title />
      <Content />
      <TableOfContents />
    </div>
    <Footer />
  </div>
</template>

<style scoped lang="scss">
.blog-container {
  min-height: 100vh;
  padding-top: 60px;
}

.post-content {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1.5rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
}
</style>
