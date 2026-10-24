---
id: PLAN-DASH-06
date: 2026-10-24
status: todo
challenge: [quick-check-tool, business-models]
covers: [QCT-SCOPE-05, QCT-SCOPE-12, BM-SCN-01, BM-SCN-02, BM-SCN-03, BM-SCN-04, OQ-23, OQ-25]
blocked_by: [PLAN-DASH-05]
---

# Phase 06 · Demo examples

## Goal

Six realistic example projects, both modules filled, that show the whole product in a demo (D-04).

## Requirements covered

QCT-SCOPE-05, QCT-SCOPE-12 (reference scenarios), BM-SCN-01..04, OQ-23, OQ-25; DESIGN-TOKENS §6 label "Illustrative inputs only".

## Steps

1. `lib/examples/`: one file per example plus `index.ts`. Visible text is stored as `{ en, de }`, an allowed exception to the dictionary rule. `localizeExample(example, lang)` returns a valid Project, and that project is copied when the user picks the example.

   | # | Based on | Target verdict |
   |---|---|---|
   | 1 | BM-SCN-01 rural village + hotel | Not promising |
   | 2 | BM-SCN-02 school, kindergarten, flats (gas) | Promising |
   | 3 | BM-SCN-03 housing cooperatives, mixed ownership | Further analysis (mixed densities) |
   | 4 | BM-SCN-04 thermal spa + hotels | Further analysis (forced: unknown source) |
   | 5 | Small new-build quarter, ground water + waste heat | Promising |
   | 6 | Office/retail block with waste heat | Promising |

2. Tune the inputs with the real engine. "Promising" needs small projects (about 2–15 buildings, several medium/high sources; OQ-26). Map building types with QCT-REF-TYPES: school → A, kindergarten/hotel → B, spa/pool → C.
3. Fill the Business Plan with plausible content per BM-STEP-01..04. Use only the facts the scenario states, and mark invented details as illustrative.
4. Tests: each localized example (en and de) validates against the schema and reaches its target verdict.

## Open questions this depends on

OQ-23, OQ-25, OQ-26 (resolved).

## Verification

All six example tests pass, and the three result levels all appear.
