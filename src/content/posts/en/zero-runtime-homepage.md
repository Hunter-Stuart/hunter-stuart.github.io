---
title: Keeping a static homepage free of framework runtime
description: Three interactions were worth keeping — active-section highlighting, theme switching, smooth anchoring — and all three work in plain script.
date: 2026-09-06
category: Frontend
tags: [Astro, Performance, CSS]
featured: false
---

A homepage is the easiest place to pile things up: a scroll-animation library, a charting library, a UI component kit. This year I did the opposite — kept three kinds of interaction and nothing else.

## Active section: one IntersectionObserver

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

`rootMargin` narrows the detection band to roughly the middle of the viewport, so exactly one section is "current" at any moment.

## Theme switching: flip a data attribute

```ts
document.documentElement.dataset.theme = next;
localStorage.setItem('theme', next);
```

Every colour is a CSS variable. Switching does not trigger a reflow or repaint the whole page.

## Smooth anchoring: leave it to CSS

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

The `prefers-reduced-motion` fallback is one line of CSS. No script needed to check for it.

## The result

The homepage ships a few kilobytes of JavaScript, all of it plain code with no framework runtime. By the time the page arrives, the content is already complete HTML.
