---
title: 'Lift-off: why this blog is arranged in six orbits'
description: Moving off the default Hexo theme, and why altitude became the organising principle.
date: 2026-10-20
category: Meta
tags: [Astro, Design, Meta]
featured: true
---

This blog used to be Hexo with the default theme. The default theme is fine, but it assumes one thing: a blog is a reverse-chronological list of posts, and that list is the whole structure.

I wanted the homepage to say something on its own — **that going up happens in stages**. So the site is organised by altitude above the ground:

| Chapter | Altitude | Subject |
| --- | --- | --- |
| Launch pad | 0 km | Me, and this site |
| Troposphere | 12 km | Tech stack |
| Kármán line | 100 km | Projects |
| Low Earth orbit | 400 km | The log itself |
| Geostationary | 35,786 km | Everyday life |
| Deep space | 384,400 km | Contact, and further out |

## Why the axis is logarithmic

Four of the six chapters sit below 400 km, and the last one jumps to 384,000 km. Drawn linearly, the first four nodes would collapse into a single point.

So the altitude axis uses a `log10` scale:

```ts
export const altitudeOffset = (altitudeKm: number) =>
  (Math.log10(altitudeKm + 10) - minOffset) / (maxOffset - minOffset);
```

The `+10` keeps 0 km inside the logarithm. Every chapter keeps a position you can actually see and click.

## Technical choices

- **Astro**: content becomes HTML at build time; the homepage ships no framework runtime.
- **Plain CSS and inline SVG**: all six scenes — pad, clouds, Kármán line, Earth's limb, geostationary ring, Moon — are drawn in code, with zero image downloads.
- **Dual themes**: one set of semantic variables. Dark is space; light is mission control.

Each chapter is meant to be a place that can keep growing content, not decoration.
