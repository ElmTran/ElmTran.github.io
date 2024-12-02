<script setup lang="ts"></script>

<template>
  <header class="the-header">
    <div class="unit-head">
      <div class="unit-inner unit-head-inner">
        <nav class="nav-global">
          <ul>
            <li class="logo nav-link">
              <button class="btn-menu" title="Menu"></button>
              <a href="/blog/">Mengqing's Blog</a>
              <button class="btn-search" title="Search"></button>
            </li>
            <li class="nav-link">
              <a title="Categories" href="/blog/categories/">Categories</a>
            </li>
            <li class="nav-link">
              <a title="Tags" href="/blog/tags/">Tags</a>
            </li>
            <li class="nav-link">
              <a title="Search" class="btn-search" href="#">Search</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </header>
</template>
<style scoped lang="scss">
.the-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.85);
  box-shadow: 0 1px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  .unit-head {
    padding: 0.8rem 1rem;

    .unit-inner {
      margin: 0 auto;
      max-width: 1200px;
    }

    .nav-global {
      ul {
        display: flex;
        align-items: center;
        margin: 0;
        padding: 0;
        list-style: none;
        gap: 2rem;

        .logo {
          margin-right: auto;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .nav-link {
          a {
            color: #333;
            text-decoration: none;
            transition: color 0.2s ease;
            font-weight: 500;

            &:hover {
              color: #0066cc;
            }
          }

          .btn-menu,
          .btn-search {
            display: none;
            background: none;
            border: none;
            padding: 0.5rem;
            cursor: pointer;
            color: #666;
            transition: color 0.2s ease;

            &:hover {
              color: #0066cc;
            }
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    .unit-head {
      .nav-global {
        ul {
          .logo {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;

            .btn-menu,
            .btn-search {
              display: block;
            }
          }

          .nav-link:not(.logo) {
            display: none;
          }
        }
      }
    }
  }
}

</style>
