<script setup lang="ts">
import Header from "./components/Header.vue";
import { data as posts } from "../../posts.data";
import { computed, ref } from "vue";
import { withBase } from "vitepress";

// Get all unique tags
const allTags = Array.from(new Set(posts.flatMap((post) => post.tags || [])));

// Selected tag
const selectedTag = ref<string | null>(null);

// Filter posts by selected tag
const filteredPosts = computed(() => {
  if (!selectedTag.value) return posts;
  return posts.filter((post) => post.tags?.includes(selectedTag.value!));
});

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
</script>

<template>
  <div class="blog-container">
    <Header />
    <main class="blog-content">
      <div class="tags-container animated fadeInUp">
        <h2 class="tags-title">Tags</h2>
        <div class="tags-list">
          <span
            v-for="tag in allTags"
            :key="tag"
            class="tag"
            :class="{ active: selectedTag === tag }"
            @click="selectedTag = tag === selectedTag ? null : tag"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <div class="posts-list">
        <div
          v-for="post in filteredPosts"
          :key="post.title"
          class="post-item animated fadeInUp"
        >
          <a :href="withBase(`${post.url}`)" class="post-link">
            <h2 class="post-title">{{ post.title }}</h2>
            <div class="post-meta">
              <span class="post-date">{{ formatDate(post.date) }}</span>
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

.tags-container {
  margin-bottom: 3rem;

  .tags-title {
    font-size: 2rem;
    color: #333;
    margin-bottom: 1.5rem;
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;

    .tag {
      cursor: pointer;
      padding: 0.4rem 1rem;
      background: rgba(0, 102, 204, 0.1);
      border-radius: 20px;
      font-size: 0.9rem;
      color: #0066cc;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(0, 102, 204, 0.2);
      }

      &.active {
        background: #0066cc;
        color: white;
      }
    }
  }
}

.posts-list {
  .post-item {
    margin-bottom: 2rem;
    padding: 1.5rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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
    align-items: center;

    .post-date {
      color: #888;
      font-weight: 500;
    }

    .post-tags {
      display: flex;
      gap: 0.5rem;
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

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animated {
  animation-duration: 0.6s;
  animation-fill-mode: both;
  animation-name: fadeInUp;
}
</style>
