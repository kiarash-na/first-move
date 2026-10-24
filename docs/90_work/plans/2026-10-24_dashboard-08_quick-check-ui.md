---
id: PLAN-DASH-08
date: 2026-10-24
status: todo
challenge: quick-check-tool
covers: [QCT-IN-00, QCT-IN-01, QCT-IN-02, QCT-IN-03, QCT-IN-04, QCT-IN-05, QCT-IN-06, QCT-IN-07, QCT-IN-08, QCT-IN-09, QCT-KF-02, QCT-KF-03, QCT-KF-04, QCT-KF-06, QCT-KF-07, QCT-SCOPE-03, QCT-SCOPE-04, QCT-SCOPE-07, QCT-SCOPE-08, QCT-REF-1.1, OQ-03, OQ-04]
blocked_by: [PLAN-DASH-07]
---

# Phase 08 · Quick Check inputs, results, assumptions

## Goal

Step-by-step inputs with live results, a full results page and a transparent assumptions page.

## Requirements covered

`10_quick-check-tool/01_input-project-data/` and `04_understand-key-factors/` (KF-02, 03, 04, 06, 07); QCT-SCOPE-03/04 (intro copy); QCT-SCOPE-07/08 (disclaimers); D-10, D-31.

## Steps

1. `features/quick-check/steps/`, one folder per step:
   - `area`: QCT-IN-01, 02; derived density + category read-only (OQ-04)
   - `buildings`: QCT-IN-04 5×5 share grid (Industry included, period labels verbatim per OQ-03) with a live sum
   - `sources`: QCT-IN-06/07 source cards with Low/Medium/High/Unknown
   - `options`: QCT-IN-05, 08, 09

   Fields render from the registry, and errors come from `applyPatch`.
2. A live result rail next to the steps (compact verdict + 4 indicators). It collapses below 1100px.
3. `results` page:
   - verdict, with its forced reasons
   - drivers
   - one indicator card per TBL-7..10 class (value, badge, EN/DE explanation)
   - heating and cooling coverage side by side
   - unknown-source explanation
   - manual vs estimated network-length tag
   - the "screening, not a full feasibility study" line
4. `features/assumptions/`:
   - TBL-1..6 as read-only tables
   - the OQ answers in use
   - **Play with parameters** toggle (TBL-4/5/6 overrides), with a "Custom parameters" badge everywhere and a reset
5. Tests: each step's validation and patching, the share-sum states, the forced-reason messages, the playground badge and reset.

## Open questions this depends on

OQ-03, OQ-04 (resolved).

## Verification

Edit example 2 so a source is Unknown → the verdict switches to Further analysis with its reason, in both languages.
