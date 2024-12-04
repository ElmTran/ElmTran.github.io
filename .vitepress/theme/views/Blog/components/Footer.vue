<script setup lang="ts">
import { useData } from "vitepress";

const { site } = useData();

const socialLinks = site.value.themeConfig.socialLinks;
</script>

<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="about-section">
        <h4><a href="/about/">About</a></h4>
        <p>
          {{ site.themeConfig.footer.message }}
        </p>
        <p>
          {{ site.themeConfig.footer.copyright }}
        </p>
        <p class="credits">
          <small>
            Powered by
            <a href="https://vitepress.dev" target="_blank" rel="noopener"
              >VitePress</a
            >
          </small>
        </p>
      </div>
      <div class="social-links">
        <a
          v-for="social in socialLinks"
          :key="social.link"
          :href="social.link"
          :aria-label="social.ariaLabel"
          target="_blank"
          rel="noopener"
          class="social-link"
        >
          <span class="icon">{{ social.icon }}</span>
        </a>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.footer {
  margin-top: 3rem;
  padding: 1.5rem 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);

  .footer-content {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;

    .about-section {
      h4 {
        margin: 0 0 0.5rem;
        font-size: 0.9rem;
        font-weight: 500;

        a {
          color: #666;
          text-decoration: none;
          transition: color 0.2s ease;

          &:hover {
            color: #42b883;
          }
        }
      }

      p {
        margin: 0.3rem 0;
        color: #888;
        font-size: 0.85rem;
      }

      .credits {
        color: #aaa;
        font-size: 0.8rem;

        a {
          color: #888;
          text-decoration: none;
          transition: color 0.2s ease;

          &:hover {
            color: #42b883;
          }
        }
      }
    }

    .social-links {
      display: flex;
      gap: 0.8rem;
      justify-content: center;

      .social-link {
        color: #888;
        text-decoration: none;
        transition: all 0.2s ease;

        .icon {
          font-size: 1.2rem;
        }

        &:hover {
          transform: translateY(-1px);
          color: #42b883;
        }
      }
    }
  }
}
</style>
