---
layout: post
title: "Frontend Note"
description: "前端笔记"
categories: [technology]
tags: [frontend, css, html, vue, dom, javascript]
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

https://btxx.org/posts/Please_Make_Your_Table_Headings_Sticky/


## dom实现

https://lazamar.github.io/virtual-dom/


## unicss图标无法显示

https://www.whidy.net/unocss-dynamic-icon-not-show