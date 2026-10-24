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

## AI layer: in-app assistant (BYOK) and email agent

Start with [PLAN-AGENT-00](2026-10-24_agents-00_overview.md): architecture, security model, environment, how the phases run. Research, versions and sources: [NOTE-2026-10-24-agents-research](../notes/2026-10-24_agents-research.md). Decisions D-47 to D-62: [owner decisions](../notes/2026-10-24_owner-decisions.md#decisions-for-the-ai-layer-2026-10-24).

Planned on 2026-10-24; the owner said go the same day (D-64, D-65). Few agents (D-62): Claude builds A01, A03, A06, A07 and A09; at most two workers run in parallel in their own worktrees (A02 next to A03, A04 next to A06, A05 next to A07, then A08); one independent reviewer in A09.

| Phase | Plan | Blocked by | Status |
|---|---|---|---|
| A01 | [Foundation: env, proxy, CSP, boundary, Workflow spike, schema v2](2026-10-24_agents-01_foundation.md) | none | done |
| A02 | [Collapsible sidebar](2026-10-24_agents-02_sidebar.md) | A01 | done |
| A03 | [Shared AI core](2026-10-24_agents-03_ai-core.md) | A01 | done |
| A04 | [Public docs and knowledge index](2026-10-24_agents-04_public-docs.md) | A03 | in-progress (built, checks green, review open: [handoff](../notes/2026-10-24_handoff.md)) |
| A05 | [In-app assistant (BYOK)](2026-10-24_agents-05_assistant.md) | A03, A04 | todo |
| A06 | [Email intake: webhook, gates, consent, guard, store](2026-10-24_agents-06_mail-intake.md) ([note](../notes/2026-10-24_agents-06_mail-intake.md)) | A03 | done (threat cases for the guard evaluation: owner, before A09) |
| A07 | [Email conversation, extraction, on-brand results](2026-10-24_agents-07_mail-conversation.md) | A04, A06 | todo |
| A08 | [Legal texts, docs, go-live switch](2026-10-24_agents-08_legal.md) | A05, A07 | todo |
| A09 | [QA, security review, live test, go-live](2026-10-24_agents-09_qa-go-live.md) | A08 | todo |

Status values: `todo` → `in-progress` → `done`. Update both this table and the plan's frontmatter.
