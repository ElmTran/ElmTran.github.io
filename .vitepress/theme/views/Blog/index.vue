<script setup lang="ts">
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import { data as posts } from "../../posts.data";
import { withBase } from "vitepress";

// Group posts by year
const postsByYear = posts.reduce((acc, post) => {
  const year = new Date(post.date).getFullYear();
  if (!acc[year]) {
    acc[year] = [];
  }
  acc[year].push(post);
  return acc;
}, {} as Record<number, typeof posts>);

// Sort years in descending order
const sortedYears = Object.keys(postsByYear)
  .map(Number)
  .sort((a, b) => b - a);

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
      <div class="posts-list">
        <div
          v-for="year in sortedYears"
          :key="year"
          class="year-section animated fadeInUp"
        >
          <h1 class="year-title">{{ year }}</h1>
          <div
            v-for="post in postsByYear[year]"
            :key="post.title"
            class="post-item animated fadeInUp"
            style="animation-delay: calc(var(--index) * 0.1s)"
          >
            <a :href="withBase(`${post.url}`)" class="post-link">
              <h2 class="post-title">{{ post.title }}</h2>
              <div class="post-meta">
                <span class="post-date">{{ formatDate(post.date) }}</span>
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
      </div>
    </main>
    <Footer />
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

  @media (max-width: 768px) {
    padding: 1rem;
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
}

.fadeInUp {
  animation-name: fadeInUp;
}

.year-section {
  margin-bottom: 3rem;
  opacity: 0;

  .year-title {
    font-size: 2rem;
    color: #333;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #eee;
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
    opacity: 0;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 768px) {
      padding: 1rem;
      margin-bottom: 1.5rem;
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
      transition: all 0.3s ease;

      &:hover {
        background: rgba(102, 0, 204, 0.2);
      }
    }

    .tag {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      background: rgba(0, 102, 204, 0.1);
      border-radius: 4px;
      font-size: 0.8rem;
      color: #0066cc;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(0, 102, 204, 0.2);
      }
    }

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;

      .post-categories,
      .post-tags {
        flex-wrap: wrap;
      }
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
