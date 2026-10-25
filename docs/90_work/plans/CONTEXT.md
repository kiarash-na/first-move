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
| A05 | [In-app assistant (BYOK)](2026-10-24_agents-05_assistant.md) ([note](../notes/2026-10-25_agents-05_assistant.md)) | A03, A04 | done (hidden until A08 sets `AI_FEATURES_LIVE`) |
| A06 | [Email intake: webhook, gates, consent, guard, store](2026-10-24_agents-06_mail-intake.md) ([note](../notes/2026-10-24_agents-06_mail-intake.md)) | A03 | done (threat cases for the guard evaluation: owner, before A09) |
| A07 | [Email conversation, extraction, on-brand results](2026-10-24_agents-07_mail-conversation.md) ([note](../notes/2026-10-25_agents-07_mail-conversation.md)) | A04, A06 | done (owner: the deployment checklist of the note) |
| A08 | [Legal texts, docs, go-live switch](2026-10-24_agents-08_legal.md) | A05, A07 | todo |
| A09 | [QA, security review, live test, go-live](2026-10-24_agents-09_qa-go-live.md) | A08 | todo |

Status values: `todo` → `in-progress` → `done`. Update both this table and the plan's frontmatter.

## AI Plan Score (BYOK, Jev)

A separate AI scoring of the Business Plan: [PLAN-AI-SCORE-00](2026-10-24_ai-score-00_plan.md) (architecture, steps) and [PLAN-AI-SCORE-01](2026-10-24_ai-score-01_method.md) (rubric, gates, dimensions, sources; method 1.1.0). Decisions D-71 to D-81: [owner decisions](../notes/2026-10-24_owner-decisions.md#decisions-for-the-ai-plan-score-2026-10-24).

| Phase | Plan | Blocked by | Status |
|---|---|---|---|
| S00 | [AI Plan Score](2026-10-24_ai-score-00_plan.md) | none | done ([note](../notes/2026-10-25_ai-score.md); follow-ups done: output caps, formal German, label on the shown score (D-81, method 1.1.0), run hint, slide 5 sources ([note](../notes/2026-10-25_ai-score-followups.md)); owner: live test with a real Gateway key, confirm D-81) |

## Open tasks from the owner (2026-10-25, overnight run)

The owner gave these in chat on 2026-10-25 and asked for them to be finished, tested and pushed to `dev` overnight (no PR until the owner asks). Work runs as sequenced workflows of sub-agents in worktrees; the orchestrator merges each step into `dev`, commits and pushes. Keep this list current: it is the memory of the run.

| # | Task | Depends on | Status |
|---|---|---|---|
| O1 | AI Plan Score: route UI with key, run and live decision-flow graph; result views; "Pitch completeness" rename and the bolder AI Plan Score badge; legal texts; method file; docs page ([PLAN-AI-SCORE-00](2026-10-24_ai-score-00_plan.md)) | none | done ([note](../notes/2026-10-25_ai-score.md)); left for the owner: the live test with a real Gateway key and the open questions of the note |
| O2 | Reference cases: 3 real Vienna anergy projects and 3 fictional plans around real Vienna buildings (D-76, D-79), weak, middling, strong; start screen (last, collapsed) and docs page with verified links | none | done ([note](../notes/2026-10-25_ai-score.md)); owner to confirm the real organisations named as anchors (note, question 13) |
| O3 | `/presentation` route, at most 10 slides, very little text, premium animations and interactions, link in the site footer; slides: why "First Move", what the organizers look for, Quick Check, Business Plan, the AI engine with a real blind test on a case with a known outcome, the two emails (agent@, human@), System 1 models for security, self-healing apps (concept), future features (3D building scan plus four), cost (about 180 € to make, about 5 € a month for up to 1,000 active users, maintenance not included, open to projects and long-term collaborations), the owner's page https://kiarash.online/link with an on-brand QR code and "powered by /1Slash, a human and AI service" (https://1sla.sh/) | none | done ([PLAN-PRESENTATION-00](2026-10-25_presentation-00_plan.md), [note](../notes/2026-10-25_presentation.md)); the link sits in the site footer, the landing's legal row and the phone and tablet footer; slide 5 links the Sources section of the AI Plan Score page; left for the owner: confirm the cost figures, review the German copy, record the blind test again with a Gateway key (open questions 1–4 of the note) |
| O4 | Home page: visual and code audit and fix on brand (Fable), plus a scroll-animated section for the AI Plan Score | none | done ([PLAN-LANDING-FIX-00](2026-10-25_landing-fix-00_plan.md), [note](../notes/2026-10-25_landing-fix-00.md)); since the landing polish the AI Plan Score chapter replays the recorded blind test (D-LP-5) |
| O5 | A SEPARATE phone and tablet version of the landing page; the desktop version stays untouched (pixel-identical) | O4 | done ([PLAN-LANDING-MOBILE-00](2026-10-25_landing-mobile-00_plan.md), [note](../notes/2026-10-25_landing-mobile-00.md)); left for the owner: where the desktop starts, deep links on phones, both versions in the HTML, a shorter phone page ([presentation note](../notes/2026-10-25_presentation.md#open-questions-for-the-owner), questions 5–8) |
| O6 | Home page: no italic text; the words that are italic now take the same style as the main title | O4, O5 | done ([PLAN-LANDING-POLISH-00](2026-10-25_landing-polish-00_plan.md), [note](../notes/2026-10-25_landing-polish-00.md)), merged into `dev` with the AI Plan Score follow-ups; left for the owner: the tokens doc's "Editorial accent" row (D-LP-1) |
| O7 | In-app AI assistant (A05), **minimal and quick, no over-engineering** (owner, 2026-10-25): a 48 px `Bot` icon button fixed bottom right in the dashboard, a small panel; the PIN vault of D-50 for the key (session by default, "remember" with a 6-digit PIN); two bring-your-own-key providers for the assistant: the user's **Vercel AI Gateway** key (shared with the AI Plan Score; the vault may hold it; memory stays the default) and an **OpenRouter** key (paste; "Connect OpenRouter" with PKCE only if quick); the AI Plan Score stays on the Gateway because Jev runs there; **at key setup, everywhere a key is entered (assistant and AI Plan Score), a required notice tells the user to set a spending limit and an expiry date on the key when creating it** (owner, 2026-10-25; phrase each provider's options as its docs state them); built, tested and working | O1 | done (A05 merged at 3cdf314; visible once O9 flips `AI_FEATURES_LIVE`) |
| O8 | Email agent **finished fully and actually working** (owner, 2026-10-25): conversation, extraction and on-brand results (A07) for agent@mail.firstmove.energy, human@ forwarding to a person; tested live with the configured Resend, KV and Gateway (test mails only to the project's own addresses) | O1 | done (A07 merged at 1557a21, live-tested between the project addresses; deployment checklist in the A07 note) |
| O9 | Legal texts, docs and go-live switch of the assistant and the email agent (A08) | O7, O8 | todo |
| O11 | A link to the public docs (`/{lang}/docs`, built in A04) in the site header and the site footer (desktop and the mobile landing), checked at the very end that the docs route is complete (owner, 2026-10-25) | O3, O5 | done for the links: "Docs" in the header and footer of the landing (desktop and mobile menu and footer), the docs header and the shared footer of the docs and legal pages ([PLAN-LANDING-POLISH-00](2026-10-25_landing-polish-00_plan.md), [note](../notes/2026-10-25_landing-polish-00.md); the footer's Quick Check and Business Models lead to the docs pages of the modules, D-LP-3); left: the final check that the docs route is complete, with O10 |
| O12 | Clean-up of the legal pages and the public docs (owner, 2026-10-25): every function is built, so remove "demo", "planned", "not yet available" and "draft" wording, the German draft marking of D-44 (`DE_REVIEW_PENDING` and its banners) included; the texts describe what the app does now | O9 | todo |
| O13 | Finish everything open towards the v1.0 launch (owner, 2026-10-25): every phase in this file ends `done` or names the one thing only the owner can do; bump `package.json` to 0.8.0 and tag the last commit of the run `v.0.8` (the owner's spelling), pushed with the tag | all | todo |
| O10 | QA, security review, live test (A09) and a final full check: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, e2e, notes, push | all | todo |

### Follow-ups collected for O10 (final polish and QA)

1. Re-record the presentation's blind test (`lib/presentation/blind-test/result.json`) with method 1.1.0 and the formal German rule; regenerate `e2e/fixtures/ai-score.firstmove.json` with method 1.1.0.
2. The results scale (`ai-score/_components/results/score-scale.tsx`) marks the unrounded score: mark the displayed score so it sits in the zone its label names.
3. `fit()` in `lib/ai/plan-score/text-input.ts` can leave a space before the ellipsis.
4. `docs/02_design/first-move_ui-design-tokens.md`: the italic "Editorial accent" is no longer used on the landing.
5. The public docs route is complete (every page, the AI pages visible once the switch is on).
6. Presentation: slide 5 label "Every source, linked" again; slide 6 status of agent@ once A07 is live.
7. Privacy Policy: the email agent's TypeSafe AI processing says zero data retention is requested, not guaranteed.
8. A timing-sensitive unit test (`ai-score-view.test.tsx`, report error of the latest run) seen failing once under load.

## Handoff (2026-10-25, clean stop for a model switch)

`dev` = `origin/dev` at the commit of this section; tree clean; every sub-agent worktree merged and removed; no workflow running. Last full check (after merging A05 and A07, at 1557a21): `pnpm lint`, `pnpm typecheck`, `pnpm test` (904 files, 4043 tests) and `pnpm build` all pass; the whole e2e suite last passed at e6bbeac (181 tests) and was not run after the A05/A07 merge.

Done in this run: O1 to O8 and O11 (rows above), with notes in `docs/90_work/notes/2026-10-25_*.md` and their "Open questions for the owner" sections.

Next, in this order (each as a workflow of sub-agents in worktrees, merged into `dev` by the orchestrator, then pushed):

1. **O9 + O12 (A08):** set `AI_FEATURES_LIVE = true` (`lib/legal/ai.ts`) and `AI_PROVIDERS`; legal texts EN and DE (`ai`, `privacy`, `terms`, `cookies`, `legal`) for the AI Plan Score, the assistant (Gateway or OpenRouter key, PIN vault, IndexedDB `first-move-assistant` in the Cookie Policy) and the email agent (processors, consent, retention as `lib/mail-agent` implements it, "zero data retention requested", never "guaranteed"); remove every draft, demo, "planned", "not yet" wording and the German draft marking (`DE_REVIEW_PENDING`, D-80); docs pages `assistant` and `email-agent` describe the built functions; presentation slide 6 says agent@ is live and slide 5 reads "Every source, linked"; update legal, docs, assistant e2e specs; then an independent legal-accuracy review and a clean-up sweep, fixes, merge, full checks with the switch on. What the texts must say: the notes of A05 and A07 (`docs/90_work/notes/2026-10-25_agents-05_assistant.md`, `2026-10-25_agents-07_mail-conversation.md`). The stopped attempt left nothing behind.
2. **O10 (A09) and the follow-ups listed above:** QA and security review over the whole AI layer, the live tests that can run here (`AI_GATEWAY_API_KEY`, Resend, KV are set in the environment; test mails only between the project addresses), re-record the presentation's blind test with method 1.1.0, the results-scale mark, the remaining follow-ups; then `pnpm lint && pnpm typecheck && pnpm test && pnpm build` and the whole e2e suite.
3. **O13:** every row here `done` or naming the one owner action; `package.json` version 0.8.0; tag the last commit `v.0.8` (the owner's spelling) and push it with the tag. No PR until the owner asks.

Owner actions already known: the email agent's deployment checklist (A07 note: `RESEND_WEBHOOK_SECRET` in Vercel, the Resend webhook for `inbox.email.received` to `SITE_URL/api/mail/inbound`, `EMAIL_AGENT_ENABLED` after A08, one real outside test mail); a browser test of the AI Plan Score and the assistant with the owner's own key; confirm D-81 (label follows the shown score) and the cost figures on the presentation; https://kiarash.online/link answered 404 once during the run (later 200).

Next.js feedback candidate (AGENTS.md reporting pass, before the final response of the run): after deleting a route while `next dev` ran, `next typegen && tsc --noEmit` failed on a stale `.next/dev/types/validator.ts` until `.next/dev` was removed.
