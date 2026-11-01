---
title: Post Title
description: One-line summary, shown on the homepage and in lists
date: 2026-11-01
category: Notes
tags: [Astro, Design]
draft: false
featured: false
---

Opening paragraph — say what this post is trying to solve.

## Section

Body text. Supports **bold**, *italic*, `inline code`, and [links](https://example.com).

### Subsection

- First item
- Second item
- Nested list
  - Child item

1. Ordered list
2. Second item

Task lists work too:

- [x] Done
- [ ] Not done yet

> Quote. Good for someone else's words, or your own conclusion.
>
> Add an empty `>` line between paragraphs.

Code blocks are highlighted and follow the light/dark theme:

```ts
// Any language tag works: ts / python / c / bash / json ...
const answer = 42;
```

Inline code goes in backticks, e.g. `npm run dev`.

Tables:

| Parameter | Value | Note |
| --- | --- | --- |
| Sample rate | 48 kHz | Baseband recording |
| Centre frequency | 137.1 MHz | NOAA weather satellites |

Images live in `public/media/articles/`; the path starts at `/media/`:

![Alt text](/media/articles/demo-road.jpg)

For a visible caption, use HTML:

<figure>
  <img src="/media/articles/demo-road.jpg" alt="Alt text">
  <figcaption>Caption text renders as small grey type</figcaption>
</figure>

To size an image, add width (pixels; height scales automatically):

<img src="/media/articles/demo-portrait.jpg" width="320" alt="Portrait">

---

Closing paragraph. Wrap up, or say what comes next.
