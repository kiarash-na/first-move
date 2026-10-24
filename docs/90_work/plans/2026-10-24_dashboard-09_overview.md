---
id: PLAN-DASH-09
date: 2026-10-24
status: todo
challenge: [quick-check-tool, business-models]
covers: [QCT-SCOPE-01, QCT-SCOPE-13, QCT-KF-01, QCT-KF-05, QCT-RES-LEVELS, DESIGN-TOKENS]
blocked_by: [PLAN-DASH-08]
---

# Phase 09 · Overview and charts

## Goal

A fast, polished overview page: the verdict first, key numbers at a glance, charts that explain.

## Requirements covered

QCT-SCOPE-01/13 (key results visualized), QCT-KF-01/05, QCT-RES-LEVELS, DESIGN-TOKENS §2 state mapping and §6; D-06, D-17, D-18.

## Steps

1. Load the `dataviz` skill before writing any chart.
2. Verdict hero: level with icon + text, plus supporting and limiting drivers.
3. Primary KPI cards (large, with icon):
   - heating coverage, cooling coverage
   - total heating and cooling demand
   - revenue, investment, annual cost
4. Secondary tiles: building density, heat density, CH ratio, network length (manual/estimated), electricity, O&M, annuity.
5. Default charts:
   - coverage vs demand (SVG bullet bars)
   - revenue vs annual costs
   - investment breakdown

   On-click charts, loaded through `next/dynamic` inside a client file:
   - demand by type × period
   - supply per source vs demand
   - cost structure

   Every chart has a table view.
6. Business Plan tiles when the module is on: step progress, pitch readiness, top risks and the deal-breaker. Otherwise show an "Add Business Plan" card, and do the same for Quick Check.
7. Colors only from D-17; cyan for QC panels, orange for BP panels.
8. Tests: tiles render the right values from `run()`; optional charts load on click; the table view exists.

## Open questions this depends on

None.

## Verification

Each of the 6 examples looks right at 375/1440 in dark and light, and the overview route's first-load JS stays lean (charts are not in the initial chunk).
