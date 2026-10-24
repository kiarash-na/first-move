---
id: PLAN-DASH-13
date: 2026-10-24
status: done
challenge: [quick-check-tool, business-models]
covers: [QCT-SCOPE-01, QCT-SCOPE-06, QCT-SCOPE-10, QCT-KF-01, QCT-KF-05, D-09, D-30, D-33, D-70]
blocked_by: [PLAN-DASH-12]
---

# Phase 13 · Report and "Save as PDF"

## Goal

The last flow step of the Quick Check, *Receive an output document (e.g. PDF)* (`10_quick-check-tool/05_output-document`): "Export Results: Create a report for discussion and next steps" (QCT-SCOPE-06), "PDF or similar output" (QCT-SCOPE-01), "Show the report" (QCT-SCOPE-10). D-09 kept the Report button disabled until everything else was tested; the owner said build it (D-70): a light, printable report page, and the browser's own "Save as PDF". No PDF library.

## Requirements covered

- QCT-SCOPE-01, -06, -10: the report itself, printable and saved as PDF from the print dialog.
- QCT-KF-01..07: the report shows the same result parts as the results page (verdict and reasons, unknown sources, main factors, coverage per demand, indicators, key figures, manual or estimated network length).
- D-33: "How we calculate" written out for paper: every input step's explanation with its formulas.
- D-10: the parameters used (Tables 4 to 6), custom values marked.
- D-27, D-30, D-37: the Business Plan as written, and the unofficial pitch readiness.
- D-48: nothing leaves the browser; printing is local.

## Steps

1. **Route** `/[lang]/dashboard/report`: a static shell like every dashboard page, the project read on the client behind `ProjectGate`. `DashboardRoute` gains `report`.
2. **Shared parts** (D-34): the result panels move from `quick-check/[step]/_results/` to `dashboard/_components/results/`, and Tables 4 to 6 from `assumptions/_components/` to `dashboard/_components/assumptions/`, so the results page, the Assumptions page and the report use the same components.
3. **Logic** in `lib/report/`: `quickCheckInputs(project)` (the inputs per step, in registry order, with what an empty value stands for) and `businessPlanEntries(project)` (per step, the progress and every filled field as written).
4. **The sheet**: `data-theme="light"` on the report article (reports on light surfaces, DESIGN-TOKENS §1), header with the mark, project, date and badges; Quick Check result, inputs, parameters, equations; Business Plan and pitch readiness when the module is on; the screening note at the end. Copy in a new `report` dictionary area.
5. **Print**: `report.css` (A4, margins, page breaks, light colour scheme for the page margins); the dashboard frame, toolbar, cookie notice, toasts and info buttons carry `print:hidden`.
6. **Entry points**: the Report button in the top bar and in the project menu (below 768px) link to the report; disabled while no project is open.
7. **Tests**: unit tests for every new unit; e2e: the button opens the report, print media hides the frame, `page.pdf()` gives a multi-page A4 PDF, German follows the page language, no project means no report; the report joins the axe, responsive and performance page lists.

## Open questions this depends on

None. The report shows only what the app already computes (`run()`), nothing new.

## Verification

`pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`. Manual: open an example, Report, "Print or save as PDF", save as PDF in Chrome.
