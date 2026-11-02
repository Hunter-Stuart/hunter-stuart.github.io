---
# ── 项目模板：复制到 src/content/projects/{zh,en}/<slug>.md ──
# 文件名就是 URL：orbit-blog.md → /projects/orbit-blog
# 中英各写一份，英文放 en/ 目录（内容自己翻译，字段结构相同）

# title：显示在第三章列表和详情页大标题
title: 项目名

# summary：一句话说明，显示在第三章的列表里。也是详情页的 SEO 摘要，别留空。
summary: 一句话说清这个项目在做什么、为什么做

# status：自由文本，进行中 / 维护中 / 计划中 都行
status: 进行中

# progress：进度条百分比，0–100 的整数
progress: 72

tags: [Astro, CSS, SVG]

# date：开始时间，ISO 格式 YYYY-MM-DD
date: 2026-09-06

# updated：可选，最后一次动手的时间
updated: 2026-11-01

# links：可选，详情页底部的外部链接列表
links:
  - label: 线上站点
    href: https://example.com
  - label: 源码
    href: https://github.com/yourname/repo
---

## 想解决什么

开头说清楚这个项目要解决的问题。别写成功能列表——先说动机，再说做法。

## 怎么做的

正文支持完整的 Markdown：标题、列表、表格、代码块、图片。

```ts
// 代码块会自动高亮，并且跟随明暗主题
const answer = 42;
```

| 方案 | 取舍 |
| --- | --- |
| 方案 A | 简单，但扩展性差 |
| 方案 B | 复杂，但能长期维护 |

## 做到哪一步

进度百分比是给个大概，这里可以说得更细：已经完成什么、卡在哪、下一步打算做什么。

## 踩过的坑

写点具体的。这部分最有用——别人搜到你的文章，往往是因为同样的问题。
