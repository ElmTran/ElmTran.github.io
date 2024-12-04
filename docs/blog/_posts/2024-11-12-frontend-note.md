---
layout: post
title: "Frontend Note"
description: "前端笔记"
categories: [technology]
tags: [frontend, css, html, vue, dom, javascript]
date: 2024/11/12
---

## CSS Note

### margin

```css
margin: 1em; // 1em = 16px, apply to all sides

margin: 5px 10px; // top and bottom 5px, left and right 10px

margin: 5px 10px 15px; // top 5px, left and right 10px, bottom 15px

margin: 5px 10px 15px 20px; // top 5px, right 10px, bottom 15px, left 20px

margin: inherit; // inherit from parent

margin: initial; // default value

margin: unset; // reset to default value
```

## HTML Note
###

```html
<el-row :gutter="10">
    <!-- xs(extra small) < 768px, sm(small) >= 768px, md(medium) >= 992px, lg(large) >= 1200px -->
  <el-col :xs="24" :sm="12" :md="8" :lg="6">
  </el-col>
</el-row>
```

## 固定表头

```css
position: sticky;
top: 0;
```

## dom实现

- [virtual-dom](https://lazamar.github.io/virtual-dom/)


## unicss图标无法显示

将被扫描的文件加入配置当中，比如要加入路由文件，在`uno.config.ts`中添加
```ts
export default defineConfig({
  // ...
  content: {
    pipeline: {
      include: [
        // the default
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        // 这里只写我需要的，当然你也可以定制，参考：https://unocss.dev/guide/extracting#extracting-from-build-tools-pipeline
        "src/router/index.ts",
      ],
      // exclude files
      // exclude: []
    }
  }
)}
```

## 引用

- [Please Make Your Table Headings Sticky](https://btxx.org/posts/Please_Make_Your_Table_Headings_Sticky/)

- [UnoCSS动态图标icon无法显示解决方案](https://www.whidy.net/unocss-dynamic-icon-not-show)