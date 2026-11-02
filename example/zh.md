---
# ── 必填三项：关系到搜索引擎收录和分享卡片，别留空 ──────────────

# title：页面标题。会自动拼成「标题 — 郝瀚宇」用于浏览器标签和搜索结果。
title: 文章标题

# description：必填。它同时是 <meta description>、og:description 和
# JSON-LD 的 description —— 留空等于三处都空，分享到群里也是空白摘要。
# 一句话说清这篇解决什么问题，40–80 字最合适。
description: 一句话摘要，会显示在首页和列表里

# date：必须用 ISO 格式 YYYY-MM-DD。会转成 article:published_time 和
# JSON-LD 的 datePublished。不要写「2026年11月1日」这类格式。
date: 2026-11-01

# ── 其余字段 ────────────────────────────────────────────────

category: 笔记

# tags：尽量填。会逐条输出成 article:tag，并合成 JSON-LD 的 keywords。
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

---

<!-- 下面这节是发布前自检，这篇写完就整段删掉 -->

## 发布前自检

- [ ] **`description` 写了** —— 它同时喂给 `<meta description>`、`og:description` 和 JSON-LD 的 `description`，空了一处等于三处都空，分享到群里也是空白摘要
- [ ] **`tags` 填了** —— 逐条输出成 `article:tag`，并合成 JSON-LD 的 `keywords`
- [ ] **`date` 是 `YYYY-MM-DD`** —— 转成 `article:published_time` 和 `datePublished`
- [ ] 文件名用英文（URL 里不会出现编码乱码）

其余不用管：canonical、hreflang、分享图（`/og-image.png`）、JSON-LD 结构化数据都由 `BaseLayout` 按 `type="article"` 自动生成。
