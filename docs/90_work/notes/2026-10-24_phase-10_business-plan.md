---
id: NOTE-2026-10-24-phase-10-business-plan
date: 2026-10-24
author: Claude (phase 10 sub-agent)
relates_to: [PLAN-DASH-10, PLAN-DASH-00, BM-SCOPE-03, BM-SCOPE-05, BM-SCOPE-06, BM-SCOPE-07, BM-SCOPE-08, BM-SCOPE-11, BM-STEP-01, BM-STEP-02, BM-STEP-03, BM-STEP-04, BM-SCN-01, BM-SCN-02, BM-SCN-03, BM-SCN-04, OQ-25, ALG-04, ALG-05, ALG-06, ALG-09, ALG-10, D-27, D-28, D-29, D-30, D-32, D-33, D-34]
---

# Phase 10 · Business Plan module

Executed [PLAN-DASH-10](../plans/2026-10-24_dashboard-10_business-plan.md). `pnpm lint && pnpm typecheck && pnpm test && pnpm build` pass (329 test files, 1440 tests). No new dependency. Only the four Business Plan routes changed; no shared shell file was edited (phase 08 runs in parallel on the Quick Check routes). `CONTEXT.md` is untouched.

## Built

**Logic** (`lib/business-plan/`, pure TypeScript, one barrel `@/lib/business-plan`)

| File | What |
|---|---|
| `filled.ts` | What counts as filled (text with a visible character; a row list needs one complete row and no half-filled row, so "validation for each risk" holds) and the required properties of each item list |
| `presets.ts` | BM-SCN-01..04 presets (OQ-25): `presetPatch(scenario, texts)` sets `businessPlan.scenarioId` and exactly the site fields the scenario states; `custom` only records the choice. `presetOverwrites` lists the fields that hold the team's own text, so the UI can ask first (D-02). Fact texts are in the `business-plan` dictionary (`presets.*`); a test compares them with the scenario files in `docs/` |
| `prompts.ts` | 29 guiding prompts (key questions of BM-SCOPE-03 and BM-SCOPE-09, learnings and tips of ALG-04/05/06/09/10), each tied to a step, with kind and source tag; copy at `prompts.<id>` |
| `progress.ts` | `stepProgress`, `allProgress`, `overallProgress`: per step, how many registry fields are filled (BM-SCOPE-11, D-28). `site.currentSupply` and `site.partners` are optional (a scenario can leave them unstated) |
| `readiness-checks.ts`, `readiness.ts` | `pitchReadiness(project)`: 31 check points in 6 pitch sections (BM-SCOPE-07) and, from the same checks, the 5 V01 jury criteria (BM-SCOPE-08, labelled unofficial). Score of a section = met/total, overall = mean of the six sections; level `not-started` / `in-progress` / `ready` |
| `qc-prefill.ts` | `qcPrefill(project)`: `off` (module off), `incomplete` (with the Quick Check step to finish) or `ready` with heating and cooling demand, revenue and investment taken from `run(project)`. The Business Plan never calculates anything (D-27) |

**UI** (D-34: route components in `business-plan/_components/`, one per file with a test)

- `[step]/page.tsx` keeps `generateStaticParams`, `notFound()` and the `ProjectGate`; its body is now `<BusinessPlanStep step>`. `[step]/_steps/<step>/<step>-step.tsx` has one folder per step; `_steps/business-plan-step.tsx` picks it.
- Frame: `StepFrame` (header with orange eyebrow, `ReadinessMeter`, `StepNav` with progress per step and free navigation, `GuidingPrompts`, the step's panels), `SectionPanel` (2px orange rule), `GroupSection` and `ItemsSection` (drawn from the registry), `CanvasSection` (classic 10-block canvas layout by container query, "Focus" tag on the six blocks BM-STEP-02 stresses), `CompareModels` (D-29: duplicate the project).
- Fields (`fields/`): `FieldBlock` dispatches by kind; `BoundText` (text and long text, stored as typed), `TextListField`, `RowsField` + `RowCard` + `RemoveRowDialog` (a row with text is removed only after a confirmation), `useFieldPatch` (the only write path is `store.patch`; errors shown with `shell.validation.<code>`).
- `scenario/`: `ScenarioPicker` + `ScenarioCard` (4 presets and a custom use case, each card lists what it prefills; a confirmation lists the fields that would replace the team's text).
- `qc/`: `QcSitePanel` (step 1: buildings, area, selected sources, heating and cooling demand; "Add to heat sources" appends a sentence to the text), `QcEconomicsPanel` (step 3: revenue and investment, "Custom parameters" badge), `QcUnavailable` (link to Quick Check when the module is off, or to the step to finish), `QcFrame` (cyan rule, "Read-only"), `QcFigure`, `useQcPrefill` (recomputes `run()` only when a Quick Check input changes, not on Business Plan typing). Every number has `CalcInfo` with `explainResult(...)` (D-33).
- `readiness/`: `ReadinessPanel` (end of step 4, anchor `#readiness`), `ReadinessCard`, `ReadinessHow`.
- `components/ui/textarea.tsx` (re-themed, grows with its text via `field-sizing`).

**Copy** (EN only, D-32), all in `dictionaries/en/business-plan.json`: `presets`, `page.<step>.lead`, `stepNav`, `prompts`, `scenario`, `qc`, `ui`, `compare`, `readiness`. The shell, calc and quick-check dictionaries are unchanged. The JSON file was re-serialised with two-space indentation, so its diff is larger than the additions.

## Verified

- Example 3 (housing cooperatives) shows full readiness (100 %, 31 of 31) and is edited across all four steps in `[step]/_steps/business-plan-flow.test.tsx`: clearing a field in each step lowers the score, retyping restores it, and a second store over the same browser storage (a reload) has the same data and score. All six examples reach 100 % progress and readiness (tests in `lib/business-plan/`).
- Production build on port 3210, Playwright at 1440 and 375 px, dark and light, with Example 3 loaded and with an empty Business Plan project: no console errors or warnings, no hydration warnings, no horizontal overflow. Fixes after looking at the screenshots: the five scenario cards were too narrow (now 3 columns on wide screens), the canvas stayed in two columns at 1440 px (container query lowered to 56rem, now classic layout), the deal-breaker switch was cyan (now orange), step titles were truncated on phones (now wrap), and only three guiding prompts show on phones to keep the form near the top (the other four from 900 px).

## Deviations and documented defaults

1. **No "How we calculate" equations in the Business Plan itself.** D-27 says the Business Plan has no calculations. D-33 is met where numbers appear: each Quick Check number has the info popover with the equation and ID (`explainResult`). The pitch readiness has a collapsed "How readiness is counted" disclosure with a plain sentence and no equation (`readiness/readiness-how.tsx`), its copy in `business-plan.json` (not `calc.json`, to avoid conflicts with phase 08).
2. **Readiness scoring is a team default.** The checks per pitch section and per jury criterion (`readiness-checks.ts`) are an interpretation of BM-SCOPE-07/08; a check can sit in several sections. At least one complete risk and one critical assumption count (the V01 wording "Top 3" is not enforced). A risk or critical assumption row that is half filled keeps the check open. The jury criteria are shown as unofficial next to the pitch parts (D-30).
3. **Deal-breaker is single-choice** in the UI (marking another risk moves the flag); the schema still allows several (phase 03 deviation 4).
4. **Presets store text in the UI language** from the dictionary, so a later DE dictionary changes what a preset writes. Presets leave a field out when the scenario does not state it (BM-SCN-01 current supply "not specified", partners "to be identified").
5. **Guiding prompts are shown per step**, not next to each field. ALG-02, ALG-03, ALG-07 and ALG-08 are project context and are not turned into prompts; ALG-04 and ALG-06 are used once each.
6. **Removing a one-line entry in a text list has no confirmation** (rows with text do). A restore of an earlier version is in the project menu.
7. **Pitch readiness sits at the end of step 4** and as a small meter in the header of every step; there is no separate route.

## Follow-ups

- Phase 09 (overview): reuse `pitchReadiness(project)` and `allProgress(project)` from `@/lib/business-plan` for the Business Plan tile; they need no store, only a `Project`.
- Phase 11: DE copy (`missingKeys()` for `business-plan.json`, especially `presets`, which also writes into the project); an e2e run through the four steps (the flow test covers the logic in jsdom).
- If the owner wants the readiness checks stricter (3 risks, 3 critical assumptions per V01), change `ROW_REQUIRED` / the `rows` check in `lib/business-plan/`.

## What later phases must know

- Inputs change only through `useStore().patch`; the Business Plan fields are drawn from the registry (`fieldsOf({ module: "businessPlan", step })`), so a new BP field needs a registry entry, a dictionary label and, if it should count, a line in `progress.ts` / `readiness-checks.ts`.
- `lib/business-plan/qc-prefill.ts` is the only place the Business Plan reads Quick Check results.
- Tests: `business-plan/_components/test-utils/open-project.ts` (`openProject({ example | modules })`, `stopTabs`) gives a started store with a project open.
- Number formats use no-break spaces; compare rendered text with `text.replace(/\s/g, " ")`.

## Next.js

No Next.js problem hit. The `[step]` page stays a static shell (`generateStaticParams`, no `dynamicParams`); all project data is read on the client after the store is ready.
