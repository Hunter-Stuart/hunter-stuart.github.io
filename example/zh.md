---
title: 文章标题
description: 一句话摘要，会显示在首页和列表里
date: 2026-11-01
category: 笔记
tags: [Astro, 设计]
draft: false
featured: false
---

开头一段，先说这篇想解决什么问题。

## 一级小节

正文。支持**加粗**、*斜体*、`行内代码`、[链接](https://example.com)。

### 二级小节

- 列表项一
- 列表项二
- 嵌套列表
  - 子项

1. 有序列表
2. 第二项

任务列表也可以：

- [x] 已经做完的事
- [ ] 还没做完的事

> 引用。适合放别人的话，或者自己的结论。
>
> 多段引用就在中间加一个空的 `>` 行。

代码块会自动高亮，并且跟随明暗主题切换配色：

```ts
// 语言标记写什么都行：ts / python / c / bash / json ...
const answer = 42;
```

行内代码用反引号包起来，比如 `npm run dev`。

表格：

| 参数 | 数值 | 说明 |
| --- | --- | --- |
| 采样率 | 48 kHz | 基带录制 |
| 中心频率 | 137.1 MHz | NOAA 气象卫星 |

图片放在 `public/media/articles/`，路径从 `/media/` 开始写：

![图片说明文字](/media/articles/demo-road.jpg)

要显示图注就用 HTML：

<figure>
  <img src="/media/articles/demo-road.jpg" alt="图片说明">
  <figcaption>这里写图注，会显示成灰色小字</figcaption>
</figure>

想控制大小，加 width（单位像素，高度自动按比例）：

<img src="/media/articles/demo-portrait.jpg" width="320" alt="竖图">

---

收尾段。总结这一篇，或者说说下一篇打算写什么。
