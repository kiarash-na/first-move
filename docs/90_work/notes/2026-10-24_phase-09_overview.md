---
id: NOTE-2026-10-24-phase-09-overview
date: 2026-10-24
author: Claude (phase 09 sub-agent)
relates_to: [PLAN-DASH-09, PLAN-DASH-00, QCT-SCOPE-01, QCT-SCOPE-13, QCT-KF-01, QCT-KF-05, QCT-RES-LEVELS, DESIGN-TOKENS, D-06, D-17, D-18, D-32, D-33, D-34, OQ-04, OQ-12, OQ-17, OQ-21]
---

# Phase 09 · Overview and charts

Executed [PLAN-DASH-09](../plans/2026-10-24_dashboard-09_overview.md). `pnpm lint && pnpm typecheck && pnpm test && pnpm build` pass (419 test files, 1702 tests). `pnpm test:e2e` passes (10 tests; the start-screen test now expects the project name as the overview heading and the "Key numbers" region). No new dependency (Recharts and the shadcn chart were installed in phase 01).

## Built

**Route** `app/[lang]/(dashboard)/dashboard/overview/`: `page.tsx` (static shell; loads the new `overview` dictionary and nests an `I18nProvider`, then `ProjectGate` → `OverviewView`). The phase-07 `module-map` placeholder is gone.

| Path (under `overview/_components/`) | What |
|---|---|
| `overview-view.tsx` | Header (project name, module badges, Edit inputs / Full result), then the Quick Check part and the Business Plan part. All numbers come from `useQuickCheck()` (`run()`); nothing is computed or stored here |
| `verdict-hero.tsx` | Level with icon and text (§2 state mapping), description, "Set by a fixed rule", "Custom parameters", link to the full result, supporting and limiting drivers (`driverText`, `EffectMark`), info popover on the level |
| `kpis/` | `KpiGrid` + `KpiCard`: seven large icon cards in two groups. Energy: heating coverage, cooling coverage, heating demand, cooling demand. Economics: overall revenues, overall investment, annual costs. Each has `CalcInfo` (`explainResult`) |
| `tiles/` | `TileGrid` + `MetricTile`: eight secondary tiles (building density, heat density, CH ratio, network length entered/estimated, electricity, O&M, annuity, revenue-to-cost ratio E), each with `CalcInfo` and its class where there is one |
| `charts/` | `ChartsSection`: three default cards and the on-click picker (see below) |
| `business-plan/` | `BusinessPlanSection` (orange): `StepProgressTile` (overall + four steps, each linking to its step), `ReadinessTile` (`pitchReadiness`), `RisksTile` (top three, deal-breaker first and tagged), `DealBreakerTile` |
| `add-module-card.tsx` | "Add Business Plan" on a Quick Check project and "Add Quick Check" on a Business Plan project (`store.patch({ "meta.modules.x": true })`) |
| `quick-check-incomplete.tsx` | Quick Check on but no result yet: says so and links the open steps (`MissingSteps`) |

**Charts** (D-17, D-18; `dataviz` skill followed)

- Default 1, **coverage vs demand**: custom SVG bullet bars (`BulletBar`, no Recharts), bands and a 100 % target mark, TBL-7 ticks 70 / 100 % labelled (90 % is a band edge without a label; no room at 375 px).
- Default 2, **revenues vs annual costs**: two stacked horizontal bars on one axis (never dual-axis); revenues cyan (full, tint, hatched grey), costs orange (full, tint, hatched grey); legend per group, totals above the plot.
- Default 3, **investment breakdown**: heat pumps / network / energy supply, one orange bar each, value at the tip.
- On click (`more-charts.tsx`, `next/dynamic`, `ssr: false`, a toggle button pressed twice hides the chart): **demand by type × period** (two small multiples, heating orange and cooling cyan, the five construction periods as one ordered hue ramp), **supply per source vs demand** (grouped bars plus both demands as solid reference lines), **cost structure** (annual costs by component with share, investment by item down to each source).
- Every chart is a `ChartCard` with a Chart / Table switch; the table (`ChartTable`) lists the same rows from the same data functions (`lib/dashboard/overview/chart-data.ts`), so plot and table cannot differ. Legends have swatches (hatched where the bar is hatched) and every plot has hover tooltips (`ChartTooltipContent`, values formatted with `lib/i18n/format`).
- Shared building blocks in `dashboard/_components/charts/` (D-34): `ChartCard`, `ChartTable`, `BulletBar`, `SeriesLegend`, `HatchDefs`, `ChartSkeleton`, `chart-tokens.ts` (`SERIES` = the `--chart-*` tokens, `ramp()`), `chart-style.ts` (grid, axes, bar size ≤ 24 px, 2 px gap in the card colour, `niceMax`). No file here imports Recharts at runtime.

**Logic** (`lib/dashboard/overview/`, pure): `chart-data.ts` (`coverageRows`, `economicsData`, `investmentParts`, `demandByType`, `supplyBySource`, `costStructure`), `risks.ts` (`namedRisks`, `topRisks`, `dealBreaker`), `split-unit.ts`.

**Moved** (D-34, now shared by two routes): `quick-check/_components/effect-mark.tsx` and `missing-steps.tsx` (with their tests) → `dashboard/_components/`; imports in the phase-08 files updated.

**Edited shared files**: `components/ui/chart.tsx` (`ChartTooltipContent` skips series without a value at the hovered category, needed for stacks whose rows have different series; test added), `_components/test-utils/dictionaries.ts` (+ `overview`), `dictionaries/en/overview.json` (was `{}`), `e2e/start.spec.ts`.

**Copy** (EN only, D-32): `overview.json` (`meta`, `header`, `verdict`, `sections`, `kpi`, `tiles`, `charts.{view,coverage,economics,investment,more}`, `incomplete`, `add`, `bp`). Labels that already exist are reused: figure names from `quick-check:ui.results.figures`, classes and sources from `quick-check`, step names from `shell:nav`, readiness levels from `business-plan:readiness`. DE is `{}` and falls back to EN.

## First-load JS of the overview route

Measured on the production build (port 3209, scripts in the HTML of `/en/dashboard/overview`, Chromium):

| Route | Scripts | Raw | Gzip |
|---|---|---|---|
| `/en/dashboard/overview` | 19 | 1 122.7 KB | **340.6 KB** |
| `/en/dashboard` (start, for comparison) | 17 | 1 033.1 KB | 320.5 KB |
| `/en/dashboard/quick-check/results` | 18 | 1 118.4 KB | 337.5 KB |

Recharts is **not** in the first load (checked by searching the initial scripts for its markers). It arrives in separate chunks after the project is shown: about 167 KB gzip for everything loaded after opening the overview (route chunk, the two default Recharts cards and Recharts itself), and about 15 KB more when the first on-click chart is opened (Recharts is then already cached). Most of the 340 KB is the shared dashboard shell (React, Next, Radix, Zustand, the three dictionaries, all of `lib/project` and the engine for the client `run()`), not the overview.

## Verified

Production build on port 3209, Playwright at 375 and 1440 px, dark and light, all six examples loaded from the start screen (24 full-page screenshots), plus the three on-click charts at both widths and both themes, plus the German route once. Console: no errors, no warnings, no hydration warnings. No horizontal overflow. Fixes after looking at the screenshots: the Y-axis labels of the economics, supply and cost charts were clipped (wider axes, shares moved from the label into the value label); axis ends are now round numbers (`niceMax`), so ticks no longer read 423.9 MWh or 190k; three ticks per axis at 375 px so they do not collide; info buttons at the tile edge; the "Annual costs" label at 375 px.

Palette check (`validate_palette.js`, hexes computed from the tokens): cyan/orange pairs pass the CVD (ΔE 25.7 dark, 17.3 light) and normal-vision floors and 3:1 contrast. It reports FAIL on the generic lightness band and chroma floor because the brand colours (D-17) are fixed: cyan 500 is brighter than the band, the Paper grey has no chroma. The light cyan tint (`--chart-3`, 2.3:1) is a WARN; its relief is in place (legend with names, hatch on the third series, tooltip, table view).

## Deviations and documented defaults

1. **Seven KPI cards.** "Total heating and cooling demand" is read as two cards (heating demand, cooling demand), next to the two coverage cards and the three money cards. Grouped as Energy (4) and Economics (3).
2. **Eight secondary tiles**: the seven of the plan plus the revenue-to-cost ratio E (OQ-21), because E decides "Not promising" and has its own driver. "Annuity" shows the annualized investment (EQ-3.10f), with the hint "Annualized investment"; its info popover is `annualizedCosts`.
3. **Money colours.** Revenues are cyan (money in, Quick Check emphasis), costs and investment are orange (money out, risk); heating orange and cooling cyan wherever the demands are split. A source is never a hue (up to six sources, only five chart tokens), so supply is grouped by demand, not stacked by source.
4. **Brand over dataviz defaults**: bars have square ends (radius 0, DESIGN-TOKENS §4) instead of the 4 px rounded data end; the gap between touching marks is a 2 px stroke in the card colour.
5. **"Charts load lazily"**: besides the three on-click charts, the Recharts charts of the two default cards are also loaded with `next/dynamic` (`ssr: false`) so Recharts stays out of the first load; the coverage bullet bars are plain SVG and paint at once. Tables and legends of the default cards are eager.
6. **Chart info popovers**: the cards have no popover of their own; the numbers they show are the same values as the KPI cards and tiles, which have one (D-33). The Business Plan tiles have none either: D-27 says the Business Plan calculates nothing, and the readiness explanation is in step 4 (phase 10 deviation 1).
7. **Top risks** = the deal-breaker first, then the others in entry order, at most three, only rows with a title. The deal-breaker tile shows the first flagged risk.
8. **Overview heading** is the project name (the eyebrow says "Project overview"), so the page title in the tab is "Overview" from `overview.meta.title`.
9. **No stored state**: the open on-click chart and the Chart / Table switches are local UI state, not saved.
10. **Commit trailer.** The task text asked for `Co-Authored-By: Claude Opus 5.5`; the session's own attribution reminder names a different model, which wins over script-computed text. The commit uses the reminder's lines.

## Follow-ups

- Phase 11: DE copy for `overview.json` (`missingKeys()`); an e2e for "open example → overview → open an on-click chart → table view"; check the sticky top bar over anchored sections when a hash link (`#readiness`) is followed.
- The `validate_palette.js` FAILs are brand constraints; if the owner wants stricter chart contrast in light mode, raise the mix share of `--chart-3` / `--chart-4` in `app/globals.css`.
- Recharts logs "width(0) and height(0)" warnings in jsdom (no layout); they are harmless and only appear in test output.

## What later phases must know

- Chart numbers come only from `lib/dashboard/overview/chart-data.ts`, which reads one `QuickCheckComplete`; add a chart by adding a data function, a card with its table, and (if on click) an entry in `more-charts.tsx`.
- Any module that imports `recharts` or `components/ui/chart` must be loaded through `next/dynamic` from a client file, or it lands in the first load. `dashboard/_components/charts/index.ts` is safe to import eagerly.
- Test helpers: `overview/_components/test-utils/overview-render.tsx` (`exampleWith(id, patch)`, `completeRun`, `renderOverview(ui, project, lang)`); Recharts draws nothing in jsdom, so assert on `[data-chart=…]`, its generated style and the table view.
- Use `splitUnit` only for energy strings (`1.23 GWh/a`); do not split percentages (`126 %` in German).

## Next.js

`next/dynamic` with `ssr: false` in client files works as the lazy-loading guide says; the page stays a static shell (`generateStaticParams` untouched, no `dynamicParams`). No Next.js issue was hit.
