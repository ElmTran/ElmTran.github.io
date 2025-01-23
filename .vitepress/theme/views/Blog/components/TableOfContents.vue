<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect, nextTick } from "vue";
import { useData } from "vitepress";
import type { Header } from "vitepress";

const { page } = useData();
const headers = ref<Header[]>([]);
const activeId = ref("");

// 处理标题层级
interface TocItem extends Header {
  children: TocItem[];
}

const generateTocTree = (headers: Header[]): TocItem[] => {
  const result: TocItem[] = [];
  const stack: TocItem[] = [];

  headers.forEach((header) => {
    const item: TocItem = { ...header, children: [] };

    while (stack.length && stack[stack.length - 1].level >= header.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      result.push(item);
    } else {
      stack[stack.length - 1].children.push(item);
    }

    stack.push(item);
  });

  return result;
};

const tocTree = ref<TocItem[]>([]);

// 使用watchEffect监听页面数据变化
watchEffect(async () => {
  await nextTick();
  if (page.value?.headers) {
    headers.value = page.value.headers;
    tocTree.value = generateTocTree(headers.value);
  }
});

// 监听滚动更新当前激活的标题
const updateActiveHeader = () => {
  if (!headers.value.length) return;

  const headings = Array.from(
    document.querySelectorAll<HTMLElement>("h2, h3, h4"),
  );
  if (!headings.length) return;

  let minDistance = Infinity;
  let currentId = "";

  headings.forEach((heading) => {
    const { top } = heading.getBoundingClientRect();
    const distance = Math.abs(top);
    if (distance < minDistance) {
      minDistance = distance;
      currentId = heading.id;
    }
  });

  if (currentId !== activeId.value) {
    activeId.value = currentId;
  }
};

// 使用防抖处理滚动事件
let scrollTimer: NodeJS.Timeout | null = null;
const onScroll = () => {
  if (scrollTimer) clearTimeout(scrollTimer);
  scrollTimer = setTimeout(updateActiveHeader, 100);
};

onMounted(async () => {
  await nextTick();
  window.addEventListener("scroll", onScroll);
  updateActiveHeader();
});

onUnmounted(() => {
  if (scrollTimer) clearTimeout(scrollTimer);
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <aside class="table-of-contents" v-show="tocTree.length > 0">
    <div class="toc-container">
      <div class="toc-title">Table of Contents</div>
      <nav class="toc-nav">
        <template v-for="item in tocTree" :key="item.title">
          <li
            :class="[`level-${item.level}`, { active: activeId === item.slug }]"
          >
            <a :href="`#${item.slug}`" @click="activeId = item.slug">
              {{ item.title }}
            </a>
            <ul v-if="item.children.length > 0">
              <template v-for="child in item.children" :key="child.title">
                <li
                  :class="[
                    `level-${child.level}`,
                    { active: activeId === child.slug },
                  ]"
                >
                  <a :href="`#${child.slug}`" @click="activeId = child.slug">
                    {{ child.title }}
                  </a>
                  <ul v-if="child.children.length > 0">
                    <li
                      v-for="grandChild in child.children"
                      :key="grandChild.title"
                      :class="[
                        `level-${grandChild.level}`,
                        { active: activeId === grandChild.slug },
                      ]"
                    >
                      <a
                        :href="`#${grandChild.slug}`"
                        @click="activeId = grandChild.slug"
                      >
                        {{ grandChild.title }}
                      </a>
                    </li>
                  </ul>
                </li>
              </template>
            </ul>
          </li>
        </template>
      </nav>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.table-of-contents {
  position: fixed;
  top: 200px;
  right: calc(50% - 750px);
  width: 240px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  padding: 1rem;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  .toc-container {
    .toc-title {
      font-weight: 600;
      margin-bottom: 0.8rem;
      color: #333;
      font-size: 1rem;
    }

    .toc-nav {
      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          margin: 0.4rem 0;
          line-height: 1.4;
          transition: all 0.2s ease;

          a {
            color: #666;
            text-decoration: none;
            transition: color 0.2s ease;

            &:hover {
              color: #42b883;
            }
          }

          &.level-2 {
            padding-left: 0;
          }

          &.level-3 {
            padding-left: 1rem;
          }

          &.level-4 {
            padding-left: 2rem;
            font-size: 0.85em;
          }

          &.active {
            > a {
              color: #42b883;
              font-weight: 600;
            }
          }

          ul {
            margin-left: 1rem;
          }
        }
      }
    }
  }

  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
  }

  @media (max-width: 1480px) {
    right: 20px;
  }

  @media (max-width: 1280px) {
    display: none;
  }
}
</style>
