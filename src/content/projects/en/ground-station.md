---
title: Compact Ground Station
summary: Receiving weather satellite APT signals with an SDR and a handful of scripts.
status: Planned
progress: 20
tags: [SDR, Signal processing]
date: 2026-09-28
---

## Goal

Take an RTL-SDR, a self-built antenna and a few scripts, and receive NOAA APT signals end to end — from antenna through capture and demodulation to an actual image. I wanted the whole chain, not a ready-made decoder showing me the result.

## Done so far

- A 137 MHz dipole, cut to the right length for the band
- Confirmed the signal exists in SDR# — the APT scan tone is audible
- Captured raw IQ data

## Next

- Write the demodulator: IQ to video signal
- Handle Doppler shift — the carrier drifts during a pass
- Lock onto line sync and stitch the image together