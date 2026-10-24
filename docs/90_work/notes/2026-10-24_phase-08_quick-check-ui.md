---
id: NOTE-2026-10-24-phase-08-quick-check-ui
date: 2026-10-24
author: Claude (phase 08 sub-agent)
relates_to: [PLAN-DASH-08, PLAN-DASH-00, QCT-IN-00, QCT-IN-01, QCT-IN-02, QCT-IN-03, QCT-IN-04, QCT-IN-05, QCT-IN-06, QCT-IN-07, QCT-IN-08, QCT-IN-09, QCT-KF-01, QCT-KF-02, QCT-KF-03, QCT-KF-04, QCT-KF-05, QCT-KF-06, QCT-KF-07, QCT-SCOPE-03, QCT-SCOPE-04, QCT-SCOPE-07, QCT-SCOPE-08, QCT-REF-1.1, OQ-03, OQ-04, OQ-13, OQ-18, OQ-26, D-05, D-06, D-10, D-21, D-31, D-32, D-33, D-34, R-03]
---

# Phase 08 · Quick Check inputs, results, assumptions

Executed [PLAN-DASH-08](../plans/2026-10-24_dashboard-08_quick-check-ui.md). `pnpm lint && pnpm typecheck && pnpm test && pnpm build` pass (341 test files, 1383 tests). No new dependency. All QC pages and Assumptions still build static (○) for both languages.

## Built

**Routes** (only the placeholder bodies of `quick-check/[step]/page.tsx` and `assumptions/page.tsx` were replaced; the static `PageHeader` stays outside `ProjectGate`, the data parts inside it).

| Path | What |
|---|---|
| `quick-check/_components/` | `StepLayout` (stepper, step body as a size container, collapsed `HowWeCalculate` from `STEP_EXPLAIN[step]`, `StepFooter`, rail), `Stepper` (5 links, missing/done state from `run().incompleteSteps`, `aria-current="step"`), `StepFooter`, `MissingSteps`, `EffectMark` (supporting ↗ cyan / limiting ↘ orange + sr text), `result-rail/` (`ResultRail` sticky aside from 1101px, `MobileRail` collapsible bar up to 1100px, `RailSummary` → `RailComplete` / incomplete, `RailIndicator`) |
| `quick-check/[step]/_steps/<step>/` | `area` (`AreaStep`, `DensityPreview`), `buildings` (`BuildingsStep`, `ShareGrid`, `ShareRow`, `ShareLegend`, `ShareSumBar`, `share-columns.ts`), `sources` (`SourcesStep`, `SourceCard`), `options` (`OptionsStep`), plus `step-view.tsx` (dispatch) |
| `quick-check/[step]/_results/` | `ResultsView`, `VerdictPanel` (state mapping §2, forced tag, numbered TBL-11 reasons), `UnknownSourcesNote` (KF-06), `DriversPanel` (KF-05), `CoveragePanel` + `CoverageCard` + `CoverageScale` (KF-03/04, bullet bar 0–150 % with 70/90/100 ticks), `IndicatorGrid` + `IndicatorCard` (TBL-8 + OQ-04 category, TBL-9 + network tag, TBL-10 + dominant demand, OQ-21), `KeyFigures` (12 values), `NetworkLengthTag` (KF-07), `ScreeningNote` (SCOPE-07/08), `ResultsIncomplete` |
| `assumptions/_components/` | `AssumptionsView`, `PlaygroundBar`, `ResetDialog`, `CapacityTable` (TBL-4/5), `EconomicTable` (TBL-6), `OverrideCell`, `BuildingTables` (TBL-1..3 in tabs), `AnswersList`, `AssumptionsSection` |
| `dashboard/_components/` (shared, new files only) | `fields/` (`NumberField`, `BooleanField`, `useNumberDraft`, `useFieldPatch` + `useValidationMessage`), `use-quick-check.ts` (`useQuickCheck()`, `quickCheckOf(project)` memoized per project object), `custom-parameters-badge.tsx`, `test-utils/project-store.ts` (`projectStore(project)` with real `applyPatch`, `exampleProject(id)`, `emptyProject()`) |
| `lib/` | `lib/quick-check/area-preview.ts` (EQ-3.3 + TBL-8 + OQ-04 before the rest is filled), `lib/dashboard/share-sum.ts` (sum, rows, columns, state empty/under/exact/over via `groupRuleStatus`), `number-input.ts` (format/parse for inputs, D-21), `result-text.ts` (`reasonText`, `driverText`, `joinList` via `Intl.ListFormat`), `indicator-effect.ts` |

**How inputs work (D-05, D-21).** Every input is rendered from its registry entry (`fieldsOf` / `groupsOf` / `cellField`) and every keystroke goes through `store.patch`. Text that does not parse is patched as the raw string, so `applyPatch` returns the `type` error; all messages come from `shell.validation.<code>` via `validationMessage`. A rejected value keeps the typed text and its error; the project keeps its last valid value. Typing is never reformatted while it already shows the stored value (`"1."`, `"0,50"`); on blur a valid value is shown grouped in the UI language. A change from elsewhere (reset, other tab) replaces the text.

**Copy (EN only, D-32).** `quick-check.json`: `ui.*` (stepper, footer, step intros incl. QCT-SCOPE-03/04 on the area step, field hints, area/buildings/sources/rail/results texts, `customParameters`), plus `sources.<s>.inText` and `results.demands.<d>.inText` (lower-case names inside sentences). `assumptions.json` (was `{}`): lead, sections, table titles/units, playground, flags (OQ-18, OQ-26), `answers.items` = OQ-01..22 and OQ-26 with title and answer **copied from the OQ files**; `answers-list.test.tsx` fails if a title or answer drifts from the docs. `testDictionaries` now includes `assumptions`.

## Verified

Production build on port 3208, Playwright at 1440 and 375 px, dark and light, with examples opened from the start screen (school-kindergarten-flats for every route; thermal-spa-hotels for the forced verdict, the playground with a custom value and an invalid COP, and the open mobile rail). No console errors or warnings, no hydration warnings, no horizontal overflow. Fixes after looking at the screenshots: the share-grid type column wrapped long descriptions into tall rows (descriptions now in a legend under the wide grid, inline on phones; mobile cells 3 per row); the sources step repeated the page intro as its own heading (removed, kept as the region name); the options divider stopped at half width; the mobile rail trigger let the "Further analysis required" badge cover the chevron (label is screen-reader only below 768px).

Plan verification: `results-view.test.tsx` opens example 2 (school, kindergarten and flats, Promising), sets geothermal to Unknown and checks Further analysis, the forced tag, the `unknown_source` reason with the source name and the KF-06 note, in EN and DE.

## Deviations and documented defaults

1. **Rail indicators.** "Compact verdict + 4 indicators" = supply coverage (one row per demand, KF-04), building density, heat density and the economic ratio E. The CH ratio is left out of the rail because TBL-10 is not decisive on its own (it is on the results page); E is in because it decides Not promising.
2. **Results page = `quick-check/results`** (`_results/` private folder next to `_steps/`), since it shares the `[step]` route.
3. **Playground state.** No stored "on" flag (phase 03): the switch is on while any override exists. Switching off with custom values asks first and resets (D-02); "Reset to defaults" uses `clearPatch(fieldsOf({ module: "quickCheck", step: "assumptions" }))`. Custom cells get an orange left rule; the "Custom parameters" badge is orange (risk) and appears in the rail, the verdict panel and the playground; it links to Assumptions.
4. **Ambient-air installation cost** shows 0 as its default with the OQ-18 note (the engine uses 0); dashes of TBL-4/5 (OQ-13) and TBL-1..3 industry (OQ-02) are never editable.
5. **Share grid layout** uses container queries (`@container` on the step body, wide table from 36rem), because the rail leaves 400–680px for the step between 1101 and 1440px.
6. **Number inputs** are `type="text"` with `inputMode`, so both decimal separators work in every browser.
7. **Hard-coded units** in the share grid (`%`), key figures (`m`) and TBL headers come from the registry `unit` or the methodology symbols, as before (phase 05/07 precedent); unit words (`buildings/ha`, `MWh/m`, `m/ha`, `/a`) are in the dictionary.

## Follow-ups

- Phase 09 (overview): reuse `useQuickCheck()`, `CustomParametersBadge`, `VerdictBadge`, `reasonText` / `driverText`, `indicatorEffect`, and the results components if a summary is wanted (they take a `QuickCheckComplete`).
- Phase 10 (BP step 1 shares inputs, D-01): `NumberField` / `BooleanField` from `dashboard/_components/fields/` work for any registry number/boolean field (`tone="hot"` for orange focus).
- Phase 11: DE copy for `quick-check.ui`, `quick-check.*.inText`, `assumptions` (`missingKeys()`); an e2e for "edit inputs → live result → results page → playground → reset".
- The sticky share-sum bar overlaps the last grid rows while scrolling (by design, it reaches its own place at the end); revisit if testers find it in the way.

## What later phases must know

- Read the live result with `useQuickCheck()` (shared `run()` per project state; never compute QC numbers elsewhere). Results are never stored.
- Change inputs only with `useFieldPatch()` (→ `store.patch`), and show its errors with `useValidationMessage()`.
- Component tests: `projectStore(exampleProject("…"))` gives a ready store whose `patch` runs the real `applyPatch`; `renderDashboard(ui, { store, lang })`.

## Next.js

No new Next.js API. Pages keep `generateStaticParams` and async `params`; client data only after mount via the store (skeleton from `ProjectGate`). One verification-script slip unrelated to Next.js: a broad `pkill -f next-server` was issued while stopping the server; it ended the shell first and the own server was then stopped by PID.
