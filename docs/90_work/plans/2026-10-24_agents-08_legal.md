---
id: PLAN-AGENT-08
date: 2026-10-24
status: todo
challenge: [quick-check-tool, business-models]
covers: [D-42, D-44, D-46, D-48, D-56, D-61, D-39, D-40]
blocked_by: [PLAN-AGENT-05, PLAN-AGENT-07]
---

# Agents 08 · Legal texts, docs and the go-live switch

## Goal

Make every published statement true for the live features, then switch the in-app assistant on (`AI_FEATURES_LIVE = true`) in the same commit. Facts come from official sources or from the owner, never from guesses (memory: legal scope).

**Pre-update (2026-10-24, D-63):** the AI page, Privacy Policy, Cookie Policy and Terms (version 1.1, EN plus DE drafts) already describe the planned design, including the e-mail tracking section. This phase checks them against the built code, moves the processor names (TypeSafe AI, Anthropic, Upstash, Vercel AI Gateway) into `lib/legal/operator.ts` tokens, fills `AI_PROVIDERS`, bumps the versions again if anything changes, and flips the switch.

## Requirements covered

D-42 and the AI go-live checklist in the [phase 12 note](../notes/2026-10-24_phase-12_legal.md), D-44 (EN reference; DE drafts marked), D-46, D-48, D-56 (retention), D-61, D-40 (facts in `lib/legal/operator.ts`).

## Steps

1. **Facts** (official pages; URLs into the note; anything unconfirmed goes on the owner list, not into the text): Anthropic (entity, country, transfer safeguard, API retention), OpenRouter (entity, country), Vercel for Functions, Workflow and the AI Gateway (DPF, ZDR default, run-data retention per plan), TypeSafe AI behind Jev (entity, country, retention or ZDR through the Gateway), Upstash (entity, EU region, DPA), Resend (EU sending region; account data and logs in the US).
2. **`lib/legal/operator.ts`**: processors for agent@ (Resend, Vercel incl. Workflow and AI Gateway, TypeSafe AI through the Gateway, Anthropic, Upstash) and the in-app providers (`AI_PROVIDERS` in `lib/legal/ai.ts`: Anthropic, OpenRouter, with region and link).
3. **Haiku through the Gateway (D-64):** the Privacy Policy and the AI page say Claude Haiku is also requested through Vercel's AI Gateway (the Vercel row already says it "passes the model requests on"); Anthropic stays the recipient, with no zero-data-retention claim for it.
4. **AI page** (`ai.json`, EN, then the DE draft): live status; providers including the Auto Router; key handling (session or PIN vault, what the PIN does and does not protect, remove key, **set a spending limit**); what a question sends (the question, the open project's inputs and results, attached documents) and to whom; chat history kept on the device; labels (AI badge, `data-ai-generated`, AI chips, provenance in the data and the export); the email agent section (consent step, decision model and text model with their providers, the rules: warning, 30-day pause, block; retention; normal replies are not reviewed by a person; blocks alert the operator).
5. **Privacy Policy** (`privacy.json`): the email processing (purposes; Art. 6(1)(b) for the requested service after accepting the Terms, Art. 6(1)(f) for abuse prevention and security; recipients and transfers; the retention table of D-56 plus Resend's 30 days and Workflow run data), the `security` sentence about the CSP (now: own origin, plus the two AI providers on dashboard pages when you use the assistant), the `ai-features` section (live), the processor table row "AI service provider for agent@" filled with the facts from step 1.
6. **Cookie Policy** (`cookies.json`): check that phases 02 and 05 added `first-move:sidebar`, `first-move:assistant`, `first-move:assistant-oauth` and the `first-move-assistant` IndexedDB database (`vault`, `chats`); update the `no-tracking` CSP sentence.
7. **Terms** (`terms.json`): AI features (bring your own key, provider costs and terms, the spending-limit duty) and the email agent (the confirm click accepts the Terms; emails only about the request, no marketing; replies are AI-generated and not binding).
8. **Switches and versions:** `AI_FEATURES_LIVE = true` (update `lib/legal/ai.test.ts`); bump `updated` and `version` in every changed document, EN and DE equal (test); `DE_REVIEW_PENDING` stays true.
9. **Repo docs:** `SECURITY.md` (scope now includes both AI layers, the webhook and the consent endpoint; residual risks from PLAN-AGENT-00), `README.md` (features, setup with `.env.example`, `pnpm gen:knowledge`, `pnpm mail-agent:*` scripts), check the `CLAUDE.md` rule from phase 01.
10. **Owner list** in the note: facts to confirm, DPAs to sign or check (Vercel, Resend, Anthropic, Upstash; TypeSafe through Vercel), the lawyer review from the phase 12 checklist.

## Open questions this depends on

None in OQ files; the owner list in the note.

## Verification

`pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e` (legal suites in EN and DE; the facts test covers every storage key in the code). A manual read of the AI page, Privacy Policy and Cookie Policy against PLAN-AGENT-00 and the code.
