---
id: PLAN-DASH-05
date: 2026-10-24
status: todo
challenge: quick-check-tool
covers: [QCT-CALC-00, EQ-3.1, EQ-3.2a, EQ-3.2b, EQ-3.2c, EQ-3.2d, EQ-3.3, EQ-3.4a, EQ-3.4b, EQ-3.5, EQ-3.6a, EQ-3.6b, EQ-3.7, EQ-3.8a, EQ-3.8b, EQ-3.9a, EQ-3.9b, EQ-3.9c, EQ-3.10a, EQ-3.10b, EQ-3.10c, EQ-3.10d, EQ-3.10e, EQ-3.10f, EQ-3.11, EQ-3.12, TBL-1, TBL-2, TBL-3, TBL-4, TBL-5, TBL-6, TBL-7, TBL-8, TBL-9, TBL-10, TBL-11, QCT-REF-1.1, QCT-REF-1.2, QCT-REF-1.3, QCT-REF-1.4, QCT-EVAL-4, QCT-EVAL-4.1, QCT-EVAL-4.2, QCT-EVAL-4.3, QCT-EVAL-4.4, QCT-EVAL-4.5, QCT-RES-LEVELS, QCT-RULE-INDUSTRY, QCT-RULE-UNKNOWN, QCT-KF-01, QCT-KF-05, QCT-SCOPE-02, QCT-IN-05, QCT-IN-08, QCT-IN-09, OQ-01, OQ-02, OQ-05, OQ-06, OQ-07, OQ-08, OQ-09, OQ-10, OQ-11, OQ-12, OQ-13, OQ-14, OQ-15, OQ-16, OQ-17, OQ-18, OQ-19, OQ-20, OQ-21, OQ-22, OQ-26]
blocked_by: [PLAN-DASH-03]
---

# Phase 05 · Quick Check engine

## Goal

A pure TypeScript engine: project in, full result out. It is exactly the methodology plus the resolved OQ answers, with no new method (QCT-SCOPE-02).

## Requirements covered

`10_quick-check-tool/02_run-quick-check/`, `03_receive-assessment/` and `_reference/`; the driver logic of QCT-KF-01/05; OQ-01..22 and OQ-26; D-10.

## Steps

1. `scripts/gen-reference.mjs` converts `docs/10_quick-check-tool/_reference/*.yaml` into `lib/quick-check/reference/*.gen.ts` (`pnpm gen:reference`). A test fails if the generated files are out of sync with the YAML.
2. `equations/`: one pure function per EQ (`eq-3-04a-specific-net-length.ts`, …). Each file cites its ID and `latex:` in a one-line comment. Guard against division by zero and `i = 0` in the annuity. Input rules:
   - Manual totals replace Q_heat,total / Q_cool,total; base-price terms still use N_i,p · A (OQ-05).
   - A manual network length replaces EQ-3.4b (QCT-IN-08).
   - PV = yes multiplies C_el by (1 − PV reduction) (OQ-06).
   - Null table values (industry, dashes) count as 0.
   - A source with Unknown potential adds 0 supply, cost and electricity.
   - N_total terms (EQ-3.3, 3.9c, 3.10d) use the entered total, industry included.
3. `params.ts`: effective parameters = TBL-1..6 defaults + project overrides (TBL-4/5/6 only, D-10), plus `isCustom`. All % values are divided by 100 here, once (OQ-01).
4. `classify/`: one file per indicator (TBL-7..10). Thresholds live in `rules.config.ts` (OQ-20 boundaries, OQ-21 E thresholds).
5. `overall-rule.ts`: TBL-11 with the OQ-22 precedence. It returns the level plus its reasons (forced by industry or by an unknown source).
6. `drivers.ts`: supporting vs limiting factors (density, heat density, coverage, economics, sources) for QCT-KF-01/05.
7. `run.ts` returns everything the UI needs:
   - every intermediate value
   - per-cell demand and per-source supply/cost
   - classes, level, reasons and drivers
   - flags: manual demand, estimated length, custom parameters, incomplete inputs
8. Tests:
   - every equation against hand-computed values
   - every class boundary
   - every overall-rule branch
   - one end-to-end `run()` for a small project

## Open questions this depends on

OQ-01..22 and OQ-26 (all resolved; answers are in each OQ file).

## Verification

Coverage of `lib/quick-check/` ≥ 95 %.
