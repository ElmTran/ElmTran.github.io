<script setup lang="ts">
import Header from "./components/Header.vue";
import { data as posts } from "../../posts.data";
import { withBase } from "vitepress";
import blogStore from "../../store";

console.log(posts);

function showPosts() {
  return posts.slice(
    (blogStore.currentPage - 1) * 10,
    blogStore.currentPage * 10,
  );
}
</script>

<template>
  <div class="blog-container">
    <Header />
    <main class="blog-content">
      <div class="posts-list">
        <div v-for="post in showPosts()" :key="post.title" class="post-item">
          <a :href="withBase(`/blog/posts/${post.title}`)" class="post-link">
            <h2 class="post-title">{{ post.title }}</h2>
            <div class="post-meta">
              <span v-if="post.categories" class="post-categories">
                <span
                  v-for="category in post.categories"
                  :key="category"
                  class="category"
                >
                  {{ category }}
                </span>
              </span>
              <span v-if="post.tags" class="post-tags">
                <span v-for="tag in post.tags" :key="tag" class="tag">
                  {{ tag }}
                </span>
              </span>
            </div>
            <p v-if="post.description" class="post-description">
              {{ post.description }}
            </p>
          </a>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.blog-container {
  padding-top: 60px;
}

.blog-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.posts-list {
  .post-item {
    margin-bottom: 2rem;
    padding: 1.5rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }

  .post-link {
    text-decoration: none;
    color: inherit;
  }

  .post-title {
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
    color: #333;
  }

  .post-meta {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.8rem;
    display: flex;
    gap: 1rem;

    .post-categories,
    .post-tags {
      display: flex;
      gap: 0.5rem;
    }

    .category {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      background: rgba(102, 0, 204, 0.1);
      border-radius: 4px;
      font-size: 0.8rem;
      color: #6600cc;
    }

    .tag {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      background: rgba(0, 102, 204, 0.1);
      border-radius: 4px;
      font-size: 0.8rem;
      color: #0066cc;
    }
  }

  .post-description {
    margin: 0;
    color: #666;
    font-size: 0.95rem;
    line-height: 1.6;
  }
}
</style>
