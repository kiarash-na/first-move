# plans

Build plans. Start with [PLAN-DASH-00](2026-10-24_dashboard-00_overview.md): architecture, data model, and how the phases are run. Decisions: [NOTE-2026-10-24-owner-decisions](../notes/2026-10-24_owner-decisions.md).

One sub-agent per phase. A phase may start when everything in its `Blocked by` column is done; phases that are free at the same time run in parallel in separate worktrees (D-35). So 02 ∥ 03, then 04 ∥ 05, 06, 07, then 08 ∥ 10, then 09, then 11.

| Phase | Plan | Blocked by | Status |
|---|---|---|---|
| 01 | [Foundation](2026-10-24_dashboard-01_foundation.md) | none | done |
| 02 | [Landing as First Move (EN, DE basis)](2026-10-24_dashboard-02_landing-i18n.md) | 01 | done |
| 03 | [Project model](2026-10-24_dashboard-03_project-model.md) | 01 | done |
| 04 | [Local storage and data safety](2026-10-24_dashboard-04_storage.md) | 03 | done |
| 05 | [Quick Check engine](2026-10-24_dashboard-05_quick-check-engine.md) | 03 | done |
| 06 | [Demo examples](2026-10-24_dashboard-06_examples.md) | 05 | done |
| 07 | [Dashboard shell and start screen](2026-10-24_dashboard-07_shell-and-start.md) | 04, 06 | done |
| 08 | [Quick Check inputs, results, assumptions](2026-10-24_dashboard-08_quick-check-ui.md) | 07 | done |
| 09 | [Overview and charts](2026-10-24_dashboard-09_overview.md) | 08, 10 | done |
| 10 | [Business Plan module](2026-10-24_dashboard-10_business-plan.md) | 07 | done |
| 11 | [QA, e2e and polish](2026-10-24_dashboard-11_qa.md) | 09 | done |
| perf | Lighter first-load JS ([note](../notes/2026-10-24_perf-pass.md)) | 11 | done |
| 12 | [Legal pages, licence and cookie notice](2026-10-24_dashboard-12_legal.md) | 11 | done |

Status values: `todo` → `in-progress` → `done`. Update both this table and the plan's frontmatter.
