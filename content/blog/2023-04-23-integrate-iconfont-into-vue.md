---
layout: post
title: "Integrate iconfont into Vue"
description: "This is a simple tutorial about how to integrate iconfont into Vue."
categories: [technology]
tags: [Vue, iconfont, frontend]
date: 2023/04/23
---

## create SvgIcon component

```vue
<!-- src/components/SvgIcon/index.vue -->
<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="svgIcon" :fill="color" />
  </svg>
</template>

<script setup>
import { computed } from "vue";
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    default: "",
  },
  color: {
    type: String,
    default: "#ffffff",
  },
});

const svgClass = computed(() => {
  if (props.class) {
    return `svg-icon ${props.class}`;
  } else {
    return "svg-icon";
  }
});

const svgIcon = computed(() => `#${props.name}`);
</script>

<style lang="scss" scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
```

## register SvgIcon component and import iconfont

```js
// src/main.js
// other imports
import SvgIcon from "@/components/SvgIcon/index.vue";
import "@/assets/iconfont/index.js";
app.component("SvgIcon", SvgIcon); // register globally
// other code
```

## create iconfont.js

```js
// src/assets/iconfont/index.js
// download iconfont.js from iconfont website
```

## use SvgIcon component

```vue
<!-- src/views/xxx.vue -->
<template>
  <div>
    <svg-icon name="icon-name" />
  </div>
</template>
```
