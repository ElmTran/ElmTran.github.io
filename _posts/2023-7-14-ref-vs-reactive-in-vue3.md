---
layout: post
title: "difference between ref and reactive in vue3"
description: "Vue3 中的 ref 和 reactive"
categories: [technology]
tags: [vue3, ref, reactive, programming]
redirect_from:
  - /2023/07/14/
---
# Vue3 中的 ref 和 reactive

Vue 3 提供了两个基本的响应性 API：`reactive` 和 `ref`。尽管它们在本质上都做同样的事情（创建响应性数据），但在具体使用和行为上，有一些关键的区别。

## reactive

`reactive` 是一个函数，它接收一个普通的 JavaScript 对象，并返回一个响应性（可观察的）proxy 对象。当你改变这个 proxy 对象的属性时，Vue 能够检测到这些改变，并相应地更新 UI。

```javascript
const myReactiveObject = reactive({ count: 0 });
```

`reactive` 对象更接近于 Vue 2.x 中的 `data` 对象。这是因为你可以直接在它上面添加或删除属性，而 Vue 能够追踪这些改变。然而，它们在解构或作为函数参数传递时存在一些复杂性，因为你会失去响应性。

## ref

`ref` 也是一个函数，它创建一个响应性对象，但与 `reactive` 不同，`ref` 可以在任何类型的数据上创建响应性，包括基本类型。

```javascript
const count = ref(0);
```

为了保持数据的响应性，`ref` 创建的响应性数据始终包裹在一个对象中。你需要通过 `.value` 属性来访问这个值。

## 在什么情况下使用

关于何时使用 `reactive` 和何时使用 `ref`，这在一定程度上取决于你的编程风格和需求。

- 如果要处理的是一个对象，并且你需要添加和更改多个属性，那么 `reactive` 可能会更好。当你处理一个由多个相互关联属性构成的模型时，`reactive` 是一个明智的选择，因为你不需要为每个属性都写 `.value`。

- 如果你处理的是原始值，或者你想创建一个独立的响应性值，那么 `ref` 是一个好的选择。对于基本类型（如数字、字符串、布尔值）的响应性数据，需要使用 `ref`。

**Tips**: 与 Vue 2.x 的 `data` 对象一样，模板中的 `ref` 对象不需要 `.value` 去访问它的值，Vue 自动进行了处理。然而，在 JavaScript 中，你需要通过 `.value` 去获取或设置它的值。