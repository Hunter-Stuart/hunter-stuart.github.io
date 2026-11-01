---
title: 静态站点里，如何让首页不加载框架
description: 交互只保留三件事：章节高亮、主题切换、平滑定位——都可以用原生脚本完成。
date: 2026-09-06
category: 前端
tags: [Astro, 性能, CSS]
featured: false
---

首页本来是最容易堆东西的地方：滚动动画库、图表库、一套 UI 组件库。今年我把它反过来做，只留三类交互。

## 章节高亮：一个 IntersectionObserver

```ts
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) setActive(entry.target.id);
    }
  },
  { rootMargin: '-45% 0px -45% 0px' },
);
```

`rootMargin` 把判定区收窄到视口中线附近，这样"当前章节"始终只有一个。

## 主题切换：改一个 data 属性

```ts
document.documentElement.dataset.theme = next;
localStorage.setItem('theme', next);
```

所有颜色都是 CSS 变量，切换主题不重排、不重绘整页。

## 平滑定位：交给 CSS

```css
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

带 `prefers-reduced-motion` 的降级是一行 CSS 的事，不需要脚本判断。

## 结果

首页的 JavaScript 只有几 KB，全是原生代码，没有运行时框架。第一次进页面时，正文已经是完整 HTML。
