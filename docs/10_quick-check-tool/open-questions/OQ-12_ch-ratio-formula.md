---
id: OQ-12
title: No formula for the cooling-to-heating ratio
status: resolved
answer: 'CH = min(Q_cool,total, Q_heat,total) / max(Q_cool,total, Q_heat,total), always 0-1. The UI names the dominant demand. Both demands 0 → not applicable. (owner, 2026-10-24; NOTE-2026-10-24-owner-decisions)'
---

# OQ-12 · No formula for the cooling-to-heating ratio

**Observation:** §3.7 describes the ratio but gives no equation. Table 10 covers 0.8-1.0, 0.3-0.8 and below 0.3; values above 1.0 are not covered.

**Source quotes:**

- §3.7: "The cooling-to-heating ratio indicates how balanced the annual heating and cooling demands are. A value of 1 indicates equal heating and cooling demands, while values approaching 0 indicate an increasing imbalance. This indicator should be interpreted together with the other technical and economic indicators. An unbalanced demand profile does not automatically make a 5GDHC network unsuitable."
- Table 10: "0.8-1.0 / 0.3-0.8 / Below 0.3"

**Referenced by:** [eq-03-07_cooling-to-heating-ratio](../02_run-quick-check/eq-03-07_cooling-to-heating-ratio.md), [cls-04-04_cooling-to-heating-ratio](../03_receive-assessment/cls-04-04_cooling-to-heating-ratio.md)
