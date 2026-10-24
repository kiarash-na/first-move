---
id: NOTE-2026-10-24-phase-05-quick-check-engine
date: 2026-10-24
author: Claude (phase 05 sub-agent)
relates_to: [PLAN-DASH-05, QCT-CALC-00, QCT-EVAL-4, QCT-EVAL-4.5, QCT-KF-01, QCT-KF-05, QCT-RULE-INDUSTRY, QCT-RULE-UNKNOWN, OQ-01, OQ-02, OQ-04, OQ-05, OQ-06, OQ-10, OQ-12, OQ-13, OQ-17, OQ-18, OQ-20, OQ-21, OQ-22, OQ-26, D-10, D-32, D-33, R-01, R-02, R-03]
---

# Phase 05 · Quick Check engine

Executed [PLAN-DASH-05](../plans/2026-10-24_dashboard-05_quick-check-engine.md). `pnpm lint && pnpm typecheck && pnpm test && pnpm build` pass (156 test files, 771 tests; 53 files / 243 tests for the engine and the generator). Coverage of `lib/quick-check/`: 100 % statements, functions and lines, 98.7 % branches. No new dependency (`katex` and `yaml` were already installed in phase 01). No UI.

## Built

One import for later phases: `@/lib/quick-check` (barrel `index.ts`). Pure TypeScript, no React, no storage, no network.

| Path | What |
|---|---|
| `scripts/gen-reference.mjs` | `pnpm gen:reference`. Writes `lib/quick-check/reference/<yaml-name>.gen.ts` for every `_reference/*.yaml` (`export const TBL_1 = {…} as const`, names from the YAML `id`, `SYMBOLS` for `symbols.yaml`) and `lib/quick-check/explain/equations.gen.ts` (every equation file's frontmatter + MathML from `katex.renderToString(latex, { output: "mathml", displayMode: true, strict: "error" })`, plus the output symbol inline). `--check` exits 1 when out of date. Exports `generateReference(root)` (pure), `outdatedFiles`, `staleFiles`, `toMathml`, `frontmatterOf`. |
| `scripts/gen-reference.test.ts` | Fails when a generated file differs from the YAML/markdown or a stale `.gen.ts` exists. |
| `reference/index.ts` | Re-exports the tables; `buildingTableValue("TBL-1" \| "TBL-2" \| "TBL-3", type, period)` (column found by its printed header), `capacityTableValue(app, source, cell)`, `economicTableValue(key)`. `null` = printed dash. |
| `equations/` | One pure function per equation; first line `// EQ-x: <latex>` (a test compares it with the docs `latex:`). `divide()` guard (null for a zero denominator). `pv-reduction.ts` (OQ-06) and `economic-ratio.ts` (OQ-21) hold the two formulas that come from OQ answers. |
| `params.ts` | `effectiveParameters(project.quickCheck.overrides)` → TBL-1..3 per cell (dash → 0, `hasDefaults`), TBL-4/5 rows (dash stays `null`), TBL-6 in equation units (`%` rows ÷ 100 via `fromPercent`, the only place a % becomes a fraction; ambient-air dash → 0), `isCustom`, `customFields` (registry ids). |
| `inputs.ts` | `readInputs(project)`: shares as fractions (via `fromPercent`), selected sources in TBL-4 order, manual values, `industry`, `unknownSources`. |
| `classify/` | `rules.config.ts` (all thresholds, `BOUNDARY_TOLERANCE`, class lists, OQ-04 category map), `threshold.ts` (`classifyByRule`), one file per indicator: `coverage.ts` (TBL-7, + `coversAtLeast90`), `building-density.ts` (TBL-8 + `densityCategory`), `heat-density.ts` (TBL-9 in MWh/m, `toMwhPerMeter`), `ch-ratio.ts` (TBL-10), `economic.ts` (OQ-21). A test checks every threshold against the generated tables. |
| `overall-rule.ts` | `overallResult(input)` → `{ level, forced, step, reasons }`, TBL-11 with OQ-22 precedence. |
| `drivers.ts` | `keyFactors(input)` → `{ supporting, limiting }` (QCT-KF-01/05). |
| `stages/` | `demand`, `network`, `supply`, `economics`, `assessment` (the parts of `run`), `guard.ts` (records values an equation could not compute). |
| `run.ts` | `run(project): QuickCheckRun`. |
| `types.ts` | `QuickCheckRun = QuickCheckIncomplete \| QuickCheckComplete`, `QuickCheckValues`, `CellResult`, `SourceResult`, `QuickCheckClasses`, `QuickCheckFlags`. |
| `explain/formulas.ts` | `FORMULAS` / `FORMULA_IDS` (EQ-3.1..3.12, then `OQ-12`, `OQ-21`), `Formula` (`mathml`, `outputMathml`, `latex`, `slug`, `file`, …), `formulaNameKey(id)` → `formulas.<slug>`. |
| `explain/map.ts` | `STEP_EXPLAIN[step]` (area, buildings, sources, options, assumptions: `stepEquations()` + `calc.steps.<step>` + tables), `RESULT_EXPLAIN[key]` (every result value: formulas in methodology order, tables, `calc.results.<key>.text`), `explainResult(key, flags)` (drops the estimate's formulas and swaps the sentence when a manual value replaces it), `CalcKey` (typed dot paths of `calc.json`). |

**`run(project)`** returns, when complete: `values` (every intermediate value, units in the names: `heatingDemandKwh`, `networkLengthM`, `heatDensityMwhPerM`, revenues in €/a, investments in €, coverage and E as fractions, `null` = not relevant / not applicable), `cells` (all 25, with N_i,p and demand), `sources` (selected ones: capacity, COP, supply, c_i, C_i, electricity before/after PV), `classes`, `assessment`, `drivers`, `flags`, `parameters`. When incomplete: `missing` (registry ids) and `incompleteSteps`, plus `flags` and `parameters`.

**Copy (EN only, D-32).** `dictionaries/en/calc.json`: `steps.<step>`, `results.<key>.text` (+ `.manual`), `formulas.<slug>` (names). `dictionaries/en/quick-check.json` → `results`: `levels.<level>` (label + description from QCT-RES-LEVELS), `classes.<indicator>.<class>` (label + interpretation, verbatim from TBL-7..10, checked by a test; economic classes written for OQ-21; `notRelevant`, `notApplicable`), `reasons.<code>.label`, `drivers.<id>.<effect>.label`, `demands`, `dominantDemand`. `{sources}` / `{demands}` are placeholders for joined labels.

## Deviations and documented defaults

1. **"Relevant supply coverage is below 70 %"** (TBL-11 Not promising) is read as *any* relevant demand below 70 % (class `not_feasible`); the OQ-22 answer does not say any/all.
2. **No relevant demand** (both totals 0, only possible with manual totals or 100 % industry) does not count as "all relevant demands ≥ 90 %": it gives `no_relevant_demand` → Further analysis (in practice E is then clearly unfavorable first, so Not promising).
3. **Boundary tolerance 1e-9** in every classification, so float noise (0.8999999999999999) does not drop a value below an inclusive bound. Rounding noise only.
4. **Annuity at i = 0** uses the limit 1/p (the formula is 0/0). The schema allows an interest-rate override of 0.
5. **Non-computable values** (COP = 1 heating, COP = 0, depreciation period 0, area 0, length 0 — all forbidden by the schema) make `run` return `incomplete` with the field id, never a wrong number.
6. **Drivers**: an indicator is *supporting* when it meets its TBL-11 Promising criterion (coverage ≥ 90 %, economics favorable, density not low; so medium density supports) and *limiting* otherwise; industry and unknown sources always limit. A non-relevant demand and the CH ratio (TBL-10: not decisive on its own) are not drivers.
7. **Formulas from OQ answers** (CH ratio, OQ-12; economic ratio E, OQ-21) are written as LaTeX in `scripts/gen-reference.mjs` (no equation file holds them) and rendered next to the equations with their OQ id. EQ-3.7 itself has `mathml: null`; the map lists `["EQ-3.7", "OQ-12"]`.
8. **Cooling supply without COP** mirrors EQ-3.8a (no heat pump → supply = capacity). Unreachable: TBL-5 dash rows have neither capacity nor COP, so OQ-13 (0 cooling) holds.
9. **Electricity per source** is reported after the PV factor too, so the per-source values add up to C_el.
10. `EQUATION_IDS` stays in `lib/project/catalog/references.ts` (with its docs test); the generated file is checked against it.
11. The plan's step 3 says "all % values are divided by 100 here": the shares are inputs, so `inputs.ts` divides them, through the same `fromPercent` of `params.ts`.

## Follow-ups

- Phase 06 (examples): tune with `run()`. The OQ-26 check passes: Promising is reached for 2, 5 and 15 residential buildings (2011-today, 800 m²/building) with waste heat + ground water (+ ambient air / surface water). Oversizing the supply hurts E, because C_i and C_el use the full supply, not the demand (methodology as written). `run.test.ts` has a Promising, a Further-analysis (mixed coverage) and two Not-promising projects to start from.
- Phase 08: render `classes.*` with `quick-check:results.classes.<indicator>.<class>`; `null` coverage → `classes.notRelevant`, `null` CH/E → `classes.notApplicable`. Coverage, E and CH are fractions (`formatPercent` takes fractions); heat density for display is `heatDensityMwhPerM` (OQ-10). Show `flags.estimatedNetworkLength` (KF-07), `flags.customParameters` (D-10), and the unknown-source reason (KF-06). The Assumptions page can read `run(...).parameters` (works for incomplete projects too); OQ-18/OQ-26 flags come from the catalog.
- Phase 07/08 `how-we-calculate/`: `STEP_EXPLAIN[step]` and `explainResult(key, run.flags)`; render `FORMULAS[id].mathml` with `dangerouslySetInnerHTML` (generated at build time from docs, no user data), the name from `calc:formulas.<slug>`, the id as the label. Skip `mathml: null` (EQ-3.7) except for its name.
- Phase 09: `values` has the breakdowns the default charts need (base/energy revenue, connection fees, heat-pump/network/supply investment, annualized/electricity/O&M costs); `cells` and `sources` feed the on-click charts.
- DE copy for the new `calc` and `quick-check.results` keys is left for the translation pass (`missingKeys()`).

## What later phases must know

- Never compute Quick Check numbers outside `lib/quick-check/`; call `run(project)` (cheap, synchronous, safe to call on every change). Results are never stored or exported (D-13).
- After editing any `_reference/*.yaml` or equation file, run `pnpm gen:reference`; `pnpm test` fails until you do.
- Engine codes are snake_case values (`further_analysis`, `conditionally_feasible`, `low_coverage_and_densities`); dictionary keys use them verbatim.

## Next.js

No Next.js API was used in this phase (pure `lib/` code and a Node script).
