---
id: NOTE-2026-10-24-dashboard-13-report
date: 2026-10-24
author: Claude (phase 13, cloud session)
status: done
relates_to: [PLAN-DASH-13, QCT-SCOPE-01, QCT-SCOPE-06, QCT-SCOPE-10, D-09, D-33, D-70]
---

# Phase 13 · Report and "Save as PDF"

The Report button works (D-70 replaces "disabled" in D-09). It opens `/[lang]/dashboard/report`, a light sheet of the open project that the browser prints; "Save as PDF" in the print dialog makes the PDF. Nothing is generated on a server and no PDF library was added.

## What was built

| Part | Where |
|---|---|
| Route, static shell behind `ProjectGate`; `DashboardRoute` `report` | `app/[lang]/(dashboard)/dashboard/report/page.tsx`, `lib/dashboard/routes.ts` |
| The sheet: header (mark, project, date, module and example badges), Quick Check, inputs, parameters, equations, Business Plan, pitch readiness, footer | `report/_components/report-*.tsx` |
| Inputs per step, in registry order, with what an empty value means | `lib/report/quick-check-inputs.ts` |
| Business Plan per step: progress and every filled field, as written | `lib/report/business-plan-entries.ts` |
| Print rules: A4, margins, page breaks, light colour scheme for the page margins | `report/_components/report.css` |
| Only the sheet prints: sidebar, top bar, toolbar, cookie notice, toasts and the info buttons carry `print:hidden` | `dashboard-shell.tsx`, `(dashboard)/layout.tsx`, `calc-info.tsx` |
| Report in the top bar and the project menu, disabled without an open project | `top-bar/report-button.tsx`, `project-menu/project-menu.tsx` |
| Copy: new dictionary area `report` (EN; DE in the translation pass) | `dictionaries/{en,de}/report.json` |

The result panels moved from `quick-check/[step]/_results/` to `dashboard/_components/results/`, and Tables 4 to 6 from `assumptions/_components/` to `dashboard/_components/assumptions/` (D-34: shared parts live in the dashboard's `_components`). The results page and the Assumptions page import them from there; nothing else changed in them.

## Decisions and deviations

- **Browser print, not a PDF library.** The owner chose it (D-70). The PDF keeps selectable text and the MathML formulas; its look depends a little on the browser (Chrome and Edge print it as designed; the e2e test renders it with Chromium's `page.pdf()`).
- **Light sheet in a dark dashboard.** `data-theme="light"` on the report article re-maps every token below it (`globals.css` maps the shadcn names on `[data-theme]`), so the reused panels turn light without changes. In print, `:root[data-theme]` gets `color-scheme: light`: Chrome paints the page margins with the colour scheme's canvas colour, which was near-black under the dark theme.
- **What the report shows.** Everything the results page shows (QCT-KF-01..07), the inputs, Tables 4 to 6 with custom values marked, and the equations of each step and of the assumptions (D-33, written out instead of collapsed). Tables 1 to 3 and the answers to the open questions stay on the Assumptions page; the report would grow by several pages for values that do not change per project. The Business Plan lists only filled fields; pitch readiness shows the six pitch sections (BM-SCOPE-07) with the unofficial caveat, not the jury criteria.
- **Info buttons** ("How we calculate this") are hidden in print everywhere, not only in the report: on paper they cannot open.

## Checks

Unit tests for every new unit (`lib/report/*.test.ts`, `report/**/*.test.tsx`); e2e `e2e/report.spec.ts` (the button opens the report, print media hides the frame, a multi-page A4 PDF, German, no project). The report joins `PROJECT_PAGES`, so the axe, responsive and performance specs cover it. `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` and `pnpm test:e2e` pass on `dev`.
