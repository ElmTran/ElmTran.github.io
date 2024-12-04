<script setup lang="ts">
import { useData } from "vitepress";
const { frontmatter } = useData();
</script>

<template>
  <div class="post-header">
    <h1>{{ frontmatter.title }}</h1>
    <div class="post-meta">
      <div class="post-date">{{ frontmatter.date }}</div>
      <div class="post-categories" v-if="frontmatter.categories?.length">
        <span>Categories:</span>
        <span v-for="category in frontmatter.categories" :key="category">{{
          category
        }}</span>
      </div>
      <div class="post-tags" v-if="frontmatter.tags?.length">
        <span>Tags:</span>
        <span v-for="tag in frontmatter.tags" :key="tag">{{ tag }}</span>
      </div>
      <div class="post-description" v-if="frontmatter.description">
        {{ frontmatter.description }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.post-header {
  margin-bottom: 3rem;
  animation: fadeIn 0.8s ease-out;
  margin-top: 3rem;

  h1 {
    font-size: 2.5em;
    margin: 0 0 1rem;
    line-height: 1.3;
    color: #2c3e50;
  }

  .post-meta {
    font-size: 0.95rem;
    color: #666;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;

    > div {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .post-date {
      &::before {
        content: "📅";
        font-size: 1.1em;
      }
    }

    .post-categories {
      span:first-child {
        &::before {
          content: "📁";
          margin-right: 0.3rem;
        }
      }

      span:not(:first-child) {
        background-color: #42b883;
        color: white;
        padding: 0.2rem 0.8rem;
        border-radius: 15px;
        font-size: 0.85rem;
        transition: transform 0.2s ease;

        &:hover {
          transform: translateY(-2px);
        }
      }
    }

    .post-tags {
      span:first-child {
        &::before {
          content: "🏷️";
          margin-right: 0.3rem;
        }
      }

      span:not(:first-child) {
        background-color: #3eaf7c;
        color: white;
        padding: 0.2rem 0.8rem;
        border-radius: 15px;
        font-size: 0.85rem;
        transition: transform 0.2s ease;

        &:hover {
          transform: translateY(-2px);
        }
      }
    }

    .post-description {
      font-style: italic;
      color: #476582;
      padding: 1rem;
      background-color: rgba(66, 184, 131, 0.1);
      border-left: 4px solid #42b883;
      border-radius: 0 8px 8px 0;
      margin-top: 0.5rem;

      &::before {
        content: "💡";
        margin-right: 0.5rem;
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
