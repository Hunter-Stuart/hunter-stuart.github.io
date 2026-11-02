---
title: Lab Data Dashboard
summary: Turning scattered lab CSVs into comparable charts, with offline caching.
status: Maintained
progress: 55
tags: [TypeScript, Charts]
date: 2026-08-12
updated: 2026-10-20
---

## Why

Lab data lives in a dozen CSVs, and every group meeting meant stitching tables by hand. Re-export the same experiment and the column names no longer match.

## Where it stands

- One minimal data contract: timestamp, channel, value — everything else is metadata
- Files are read in the browser; nothing is uploaded, nothing phones home
- Charts are drawn on Canvas rather than pulling in a charting library for one line series
- The last import is cached in IndexedDB so a refresh does not lose it

## Where it is stuck

Instruments sample at different rates. Aligning them to a shared time axis forces a choice: linear interpolation distorts sharp transitions, while splines invent structure across flat stretches. Still experimenting.