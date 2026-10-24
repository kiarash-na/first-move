# plans

Build plans. Start with [PLAN-DASH-00](2026-10-24_dashboard-00_overview.md): architecture, data model, and how the phases are run. Decisions: [NOTE-2026-10-24-owner-decisions](../notes/2026-10-24_owner-decisions.md).

Run the phases one after another, one sub-agent each. A phase may start when everything in its `Blocked by` column is done.

| Phase | Plan | Blocked by | Status |
|---|---|---|---|
| 01 | [Foundation](2026-10-24_dashboard-01_foundation.md) | none | todo |
| 02 | [Landing in EN/DE as First Move](2026-10-24_dashboard-02_landing-i18n.md) | 01 | todo |
| 03 | [Project model](2026-10-24_dashboard-03_project-model.md) | 01 | todo |
| 04 | [Local storage and data safety](2026-10-24_dashboard-04_storage.md) | 03 | todo |
| 05 | [Quick Check engine](2026-10-24_dashboard-05_quick-check-engine.md) | 03 | todo |
| 06 | [Demo examples](2026-10-24_dashboard-06_examples.md) | 05 | todo |
| 07 | [Dashboard shell and start screen](2026-10-24_dashboard-07_shell-and-start.md) | 04, 06 | todo |
| 08 | [Quick Check inputs, results, assumptions](2026-10-24_dashboard-08_quick-check-ui.md) | 07 | todo |
| 09 | [Overview and charts](2026-10-24_dashboard-09_overview.md) | 08 | todo |
| 10 | [Business Plan module](2026-10-24_dashboard-10_business-plan.md) | 07 | todo |
| 11 | [QA, e2e and polish](2026-10-24_dashboard-11_qa.md) | 09, 10 | todo |

Status values: `todo` → `in-progress` → `done`. Update both this table and the plan's frontmatter.
