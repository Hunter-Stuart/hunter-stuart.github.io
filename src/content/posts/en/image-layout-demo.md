---
title: 'Image layout demo: putting pictures in a post'
description: A demo post you can delete — every common image layout, with real files.
date: 2026-11-01
category: Meta
tags: [Markdown, Images, Layout]
draft: false
featured: false
---

This post is a demo. Every image below really exists under `public/media/`, so it renders both locally and in production. Delete the whole file when you are done.

## Plain image

Files live in `public/media/articles/`; reference them with an **absolute path starting at `/media/`**:

```markdown
![Alt text](/media/articles/demo-road.jpg)
```

![The stretch with no shade](/media/articles/demo-road.jpg)

If an image does not show up, the path is almost always the problem — `public/media/...` and `./media/...` both fail.

## Image with a caption

The text inside `![...]` becomes the alt attribute, not a visible caption. For a real caption use `<figure>`:

```html
<figure>
  <img src="/media/articles/demo-road.jpg" alt="Road">
  <figcaption>The stretch with no shade left, October 2024</figcaption>
</figure>
```

<figure>
  <img src="/media/articles/demo-road.jpg" alt="Road">
  <figcaption>The stretch with no shade left, October 2024</figcaption>
</figure>

## Sizing

Add a `width` attribute; height scales automatically:

```html
<img src="/media/articles/demo-portrait.jpg" width="320" alt="Portrait">
```

<img src="/media/articles/demo-portrait.jpg" width="320" alt="Portrait">

## Two images side by side

A table is the simplest way — each image takes one equal column:

```markdown
| Left | Right |
| --- | --- |
| ![Left](/media/articles/demo-road.jpg) | ![Right](/media/articles/demo-portrait.jpg) |
```

| Left | Right |
| --- | --- |
| ![Left](/media/articles/demo-road.jpg) | ![Right](/media/articles/demo-portrait.jpg) |

## Reusing gallery images

No need to upload twice — point at the gallery copy:

```markdown
![](/media/gallery/travel/jiuzhaigou-20251001.jpg)
```

![](/media/gallery/travel/jiuzhaigou-20251001.jpg)

## Mixed with code

```python
import numpy as np

def fspl(d_km, f_mhz):
    return 32.44 + 20 * np.log10(d_km) + 20 * np.log10(f_mhz)

print(fspl(10, 2400))
```

## What works and what does not

| Syntax | Result |
| --- | --- |
| `![](/media/articles/a.jpg)` | ✅ full column width |
| `![](public/media/articles/a.jpg)` | ❌ 404 |
| `![[a.jpg]]` | ❌ Obsidian syntax, shows as text |
| `<img src="/media/articles/a.jpg" width="300">` | ✅ 300 px wide |
| `<figure>` + `<figcaption>` | ✅ with caption |

Keep each image **under 200 KB**; anything above 500 KB starts to feel slow.
