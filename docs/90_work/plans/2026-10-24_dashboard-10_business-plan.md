---
id: PLAN-DASH-10
date: 2026-10-24
status: todo
challenge: business-models
covers: [BM-SCOPE-01, BM-SCOPE-02, BM-SCOPE-03, BM-SCOPE-04, BM-SCOPE-05, BM-SCOPE-06, BM-SCOPE-07, BM-SCOPE-08, BM-SCOPE-09, BM-SCOPE-10, BM-SCOPE-11, BM-STEP-01, BM-STEP-02, BM-STEP-03, BM-STEP-04, BM-SCN-01, BM-SCN-02, BM-SCN-03, BM-SCN-04, OQ-25, SHARED-CONTEXT, ALG-02, ALG-03, ALG-04, ALG-05, ALG-06, ALG-07, ALG-08, ALG-09, ALG-10]
blocked_by: [PLAN-DASH-07]
---

# Phase 10 · Business Plan module

## Goal

A guided, qualitative workspace that turns a use case into pitch-ready content, using Quick Check numbers where available.

## Requirements covered

All of `20_business-models/`; `01_shared/` as the source for guiding prompts and tips.

## Steps

1. `features/business-plan/steps/`, one folder per step:
   - `opportunity` (BM-STEP-01): site, segments, needs, heat sources, pain point, why 5GDHC beats the alternatives
   - `business-logic` (BM-STEP-02): 9-block canvas + stakeholder allocation of investment / risk / benefit
   - `reality-check` (BM-STEP-03): rough assumptions, risk register, one deal-breaker, validation per risk
   - `implementation` (BM-STEP-04): refinements, scalability by context, next steps
2. Scenario picker: BM-SCN-01..04 presets that prefill only the stated fields (OQ-25), or a custom use case (BM-SCOPE-05/06).
3. Free navigation with progress per step (BM-SCOPE-11). Guiding prompts come from BM-SCOPE-03 key questions and ALG-05/09/10, in `lib/business-plan/prompts.ts` with i18n keys.
4. QC prefill (ALG-09): shared site, buildings and sources; QC demand, revenue and investment shown read-only in steps 1 and 3. Show a link to Quick Check when the QC module is off.
5. Pitch readiness: the 6 pitch sections (BM-SCOPE-07) + the V01 jury criteria (BM-SCOPE-08, labelled unofficial), computed from filled fields in `lib/business-plan/readiness.ts`.
6. Orange emphasis on panels (DESIGN-TOKENS §6). User text is stored as typed.
7. Tests: each step's patching and progress, preset prefill, readiness scoring, QC prefill with and without the QC module.

## Open questions this depends on

OQ-25 (resolved).

## Verification

Example 3, edited across all 4 steps, shows full readiness, and the data survives a reload.
