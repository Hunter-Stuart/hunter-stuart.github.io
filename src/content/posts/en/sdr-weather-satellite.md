---
title: Receiving weather satellite images with an SDR
description: Antenna, frequencies and decoding — a full post-mortem of one ground station experiment.
date: 2026-09-28
category: Projects
tags: [SDR, Signal processing, Hardware]
featured: true
---

The NOAA weather satellites broadcast analogue images near 137 MHz, continuously. If you can hear them, you can draw your own cloud map. This is the record of one attempt.

## Gear

- A 137 MHz QFH antenna
- An RTL-SDR
- A laptop that can run `satdump`

## Procedure

1. Look up the pass time: only the ten minutes overhead are worth recording.
2. Record baseband around 137.1 MHz — 48 kHz of sample rate is plenty.
3. Decode to an image, then overlay a georeference.

## Lessons

- Antenna height matters far more than antenna price.
- Miscalculate the pass once and you wait another twelve hours.
- 137 MHz is noisier in a city than you expect; a filter is close to mandatory.

> Next step: make it permanent on a Raspberry Pi, scheduling passes automatically and uploading results.
