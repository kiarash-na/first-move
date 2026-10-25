---
id: NOTE-2026-10-25-providers-activation
date: 2026-10-25
author: Claude (local session after PR #2)
relates_to: [PLAN-AGENT-00, PLAN-AI-SCORE-00, PLAN-AI-SCORE-01, D-44, D-48, D-50, D-71, D-72, D-82, O7, O8]
---

# Email agent activated, OpenRouter the default key (assistant + AI Plan Score)

Owner's session orders: clean stale worktrees, work on `dev`; enable the email agent; OpenRouter
becomes the main key option and default for the sidebar chat and the AI Plan Score, the Vercel AI
Gateway second; skip the legal/docs batch for now. Micro-step commits without attribution. PR #3
holds the code; this note (one commit on `dev`) is the log.

## Done

- **Cleanup:** stale worktrees and branches removed (`agents-*`, `worktree-wf_*`, `ccr-*`); `dev` fast-forwarded to `main` (PR #2 state) and re-pushed.
- **Email agent on.** `scripts/email-agent-on.mjs` (`--relay` flag included) flips `EMAIL_AGENT_ENABLED` / `EMAIL_HUMAN_RELAY_ENABLED` in `.env.local`; both are `true` locally. The Resend webhook was created with the Resend CLI: one webhook, `inbox.email.received` only, at `https://firstmove.energy/api/mail/inbound`, enabled; its signing secret went straight into local `.env.local` (never printed anywhere). The doctor is green, and the live pipeline test passed on Resend + Upstash + the Gateway: consent → guard → extraction → Quick Check result with equations and project file → hand-off → stop; 4 replies, 3 arrived at human@, relay loop-protection verified, 26 test store keys cleaned up.
- **Owner decision (2026-10-25): the human@ relay was switched on too** (locally), ahead of the privacy text naming it (the A07 checklist ties the relay to the legal batch — the owner chose to flip it now; the text lands with the legal batch below).
- **Assistant:** `PROVIDERS = ["openrouter", "gateway"]`; OpenRouter is the default-selected provider, the Gateway second. A key in memory decides; a single remembered (vault) key hints its provider, derived at render (no set-state-in-effect). Shared `firstProvider` (`lib/assistant/providers/first-provider.ts`).
- **AI Plan Score provider choice (owner, 2026-10-25).** The page starts on OpenRouter, the Gateway second:
  - Decisions on OpenRouter run through `lib/assistant/openrouter/decision-model.ts`: the same decision questions (`lib/ai/plan-score/questions.ts`) answered by **`typesafe/jev-router`** over chat completions — OpenRouter has no decision API and does not carry the pinned `typesafe-ai/jev-1.14.0`. The adapter asks for a calibrated distribution per question and normalizes it (sums to 1, score = weighted mean, choice = argmax), so the SDK's answer validation always holds; an unusable answer becomes a refusal, which `decideTurn` retries without, and a malformed JSON answer is retried once. **Runs through it record `decisionModel: "typesafe/jev-router"` and are not comparable with Gateway runs; the method stays 1.1.0** (D-71's pinning argument applies to the Gateway path).
  - Report and suggestions use the provider's chat models (Auto Router default on OpenRouter); every OpenRouter call carries `provider.data_collection: "deny"`.
  - `ScoreClient` (`lib/assistant/plan-score/client.ts`) bundles decision model, text model and the privacy options per provider; `scorePlan`/`decideTurn` take the run provider's options (the Gateway's ZDR/no-training stay the default). Error mapping uses `assistantErrorCode` for both.
  - UI per provider: key check (Gateway balance vs OpenRouter limit + expiry), model catalogues, decision-model panel (pinned Jev vs Jev Router, with the comparability note), data disclosure, cost estimate (decision price unknown on OpenRouter — priced as the routed model), O7 spending-limit/expiry notice (OpenRouter's own docs links). Dictionaries EN + DE restructured (provider-keyed); error copy is provider-neutral now.
- **Gates at the PR:** lint ✓, typecheck ✓, `pnpm test` 4076 passed/16 skipped ✓, `pnpm build` ✓. The known timing-sensitive view test flaked once under load and passed on re-run (O10 follow-up 8).

## Left (after the PR, in order)

1. **Owner on Vercel Production:** set all 20 variables of `.env.example` (local `.env.local` is complete and validated by the doctor), with `SITE_URL=https://firstmove.energy`, `EMAIL_AGENT_ENABLED=true`, `EMAIL_HUMAN_RELAY_ENABLED=true` and `RESEND_WEBHOOK_SECRET` from the Resend webhook; redeploy; then one outside test mail to agent@ and one to human@ (A07 checklist step 6).
2. **Owner live test with a real OpenRouter key** (BYOK, none exists here): the assistant chat on OpenRouter, and an AI Plan Score run through the jev-router adapter (the adapter has never seen a live answer; watch JSON-mode support of the routed model — if a model answers no JSON, the run retries once, then reports `provider`).
3. **Presentation route (owner, 2026-10-25):** cost slide gets a small note — about 17 hours of pure work and about 38 hours of AI work, not included in the calculation; a light/dark switch for the presentation route; the email agent's tag says "not built" although it is built — retag as **experimental**.
4. **One-click test-case run (owner, 2026-10-25):** the public docs promise feeding the decision engine's fields with a test case in one click and running it. Verify whether it exists; if not, build it.
5. **e2e:** only the ai-score spec was updated for the provider choice; the full e2e suite has not run since (run `pnpm test:e2e`).
6. **The deferred legal/docs batch stands** (CONTEXT.md, deferred list): AI legal texts EN+DE, O12 wording sweep, docs pages, presentation slide 5/6 texts, A09 security review. New since this session: the AI page's provider wording and the score's legal mentions still say "Gateway key" only — fold into that batch. `DE_REVIEW_PENDING` stays `true`.
7. CONTEXT.md row O13 stays in progress until the above land.
