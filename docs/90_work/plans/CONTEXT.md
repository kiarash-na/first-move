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
| 13 | [Report and "Save as PDF"](2026-10-24_dashboard-13_report.md) ([note](../notes/2026-10-24_dashboard-13_report.md)) | 12 | done |

## AI layer: in-app assistant (BYOK) and email agent

Start with [PLAN-AGENT-00](2026-10-24_agents-00_overview.md): architecture, security model, environment, how the phases run. Research, versions and sources: [NOTE-2026-10-24-agents-research](../notes/2026-10-24_agents-research.md). Decisions D-47 to D-62: [owner decisions](../notes/2026-10-24_owner-decisions.md#decisions-for-the-ai-layer-2026-10-24).

Planned on 2026-10-24; the owner said go the same day (D-64, D-65). Few agents (D-62): Claude builds A01, A03, A06, A07 and A09; at most two workers run in parallel in their own worktrees (A02 next to A03, A04 next to A06, A05 next to A07, then A08); one independent reviewer in A09.

| Phase | Plan | Blocked by | Status |
|---|---|---|---|
| A01 | [Foundation: env, proxy, CSP, boundary, Workflow spike, schema v2](2026-10-24_agents-01_foundation.md) | none | done |
| A02 | [Collapsible sidebar](2026-10-24_agents-02_sidebar.md) | A01 | done |
| A03 | [Shared AI core](2026-10-24_agents-03_ai-core.md) | A01 | done |
| A04 | [Public docs and knowledge index](2026-10-24_agents-04_public-docs.md) ([note](../notes/2026-10-24_agents-04_public-docs.md)) | A03 | done |
| A05 | [In-app assistant (BYOK)](2026-10-24_agents-05_assistant.md) | A03, A04 | todo |
| A06 | [Email intake: webhook, gates, consent, guard, store](2026-10-24_agents-06_mail-intake.md) ([note](../notes/2026-10-24_agents-06_mail-intake.md)) | A03 | done (threat cases for the guard evaluation: owner, before A09) |
| A07 | [Email conversation, extraction, on-brand results](2026-10-24_agents-07_mail-conversation.md) | A04, A06 | todo |
| A08 | [Legal texts, docs, go-live switch](2026-10-24_agents-08_legal.md) | A05, A07 | todo |
| A09 | [QA, security review, live test, go-live](2026-10-24_agents-09_qa-go-live.md) | A08 | todo |

Status values: `todo` → `in-progress` → `done`. Update both this table and the plan's frontmatter.

## AI Plan Score (BYOK, Jev)

A separate AI scoring of the Business Plan: [PLAN-AI-SCORE-00](2026-10-24_ai-score-00_plan.md) (architecture, steps) and [PLAN-AI-SCORE-01](2026-10-24_ai-score-01_method.md) (rubric, gates, dimensions, sources). Decisions D-71 to D-78: [owner decisions](../notes/2026-10-24_owner-decisions.md#decisions-for-the-ai-plan-score-2026-10-24).

| Phase | Plan | Blocked by | Status |
|---|---|---|---|
| S00 | [AI Plan Score](2026-10-24_ai-score-00_plan.md) | none | in-progress |

## Open tasks from the owner (2026-10-25, overnight run)

The owner gave these in chat on 2026-10-25 and asked for them to be finished, tested and pushed to `dev` overnight (no PR until the owner asks). Work runs as sequenced workflows of sub-agents in worktrees; the orchestrator merges each step into `dev`, commits and pushes. Keep this list current: it is the memory of the run.

| # | Task | Depends on | Status |
|---|---|---|---|
| O1 | AI Plan Score: route UI with key, run and live decision-flow graph; result views; "Pitch completeness" rename and the bolder AI Plan Score badge; legal texts; method file; docs page ([PLAN-AI-SCORE-00](2026-10-24_ai-score-00_plan.md)) | none | in-progress (workflow `ai-plan-score-build`) |
| O2 | Reference cases: 3 real Vienna anergy projects and 3 fictional plans around real Vienna buildings (D-76, D-79), weak, middling, strong; start screen (last, collapsed) and docs page with verified links | none | in-progress (same workflow) |
| O3 | `/presentation` route, at most 10 slides, very little text, premium animations and interactions, link in the site footer; slides: why "First Move", what the organizers look for, Quick Check, Business Plan, the AI engine with a real blind test on a case with a known outcome, the two emails (agent@, human@), System 1 models for security, self-healing apps (concept), future features (3D building scan plus four), cost (about 180 € to make, about 5 € a month for up to 1,000 active users, maintenance not included, open to projects and long-term collaborations), the owner's page https://kiarash.online/link with an on-brand QR code and "powered by /1Slash, a human and AI service" (https://1sla.sh/) | none | in-progress (workflow `presentation-and-landing`) |
| O4 | Home page: visual and code audit and fix on brand (Fable), plus a scroll-animated section for the AI Plan Score | none | in-progress (same workflow) |
| O5 | A SEPARATE phone and tablet version of the landing page; the desktop version stays untouched (pixel-identical) | O4 | in-progress (same workflow) |
| O6 | Home page: no italic text; the words that are italic now take the same style as the main title | O4, O5 | todo |
| O7 | In-app AI assistant (A05), **minimal and quick, no over-engineering** (owner, 2026-10-25): a 48 px `Bot` icon button fixed bottom right in the dashboard, a small panel; the PIN vault of D-50 for the key (session by default, "remember" with a 6-digit PIN); two bring-your-own-key providers for the assistant: the user's **Vercel AI Gateway** key (shared with the AI Plan Score; the vault may hold it; memory stays the default) and an **OpenRouter** key (paste; "Connect OpenRouter" with PKCE only if quick); the AI Plan Score stays on the Gateway because Jev runs there; **at key setup, everywhere a key is entered (assistant and AI Plan Score), a required notice tells the user to set a spending limit and an expiry date on the key when creating it** (owner, 2026-10-25; phrase each provider's options as its docs state them); built, tested and working | O1 | todo |
| O8 | Email agent **finished fully and actually working** (owner, 2026-10-25): conversation, extraction and on-brand results (A07) for agent@mail.firstmove.energy, human@ forwarding to a person; tested live with the configured Resend, KV and Gateway (test mails only to the project's own addresses) | O1 | todo |
| O9 | Legal texts, docs and go-live switch of the assistant and the email agent (A08) | O7, O8 | todo |
| O11 | A link to the public docs (`/{lang}/docs`, built in A04) in the site header and the site footer (desktop and the mobile landing), checked at the very end that the docs route is complete (owner, 2026-10-25) | O3, O5 | todo |
| O12 | Clean-up of the legal pages and the public docs (owner, 2026-10-25): every function is built, so remove "demo", "planned", "not yet available" and "draft" wording, the German draft marking of D-44 (`DE_REVIEW_PENDING` and its banners) included; the texts describe what the app does now | O9 | todo |
| O13 | Finish everything open towards the v1.0 launch (owner, 2026-10-25): every phase in this file ends `done` or names the one thing only the owner can do; bump `package.json` to 0.8.0 and tag the last commit of the run `v.0.8` (the owner's spelling), pushed with the tag | all | todo |
| O10 | QA, security review, live test (A09) and a final full check: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, e2e, notes, push | all | todo |
