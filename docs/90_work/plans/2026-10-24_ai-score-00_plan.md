---
id: PLAN-AI-SCORE-00
date: 2026-10-24
status: in-progress
challenge: [business-models]
covers: [D-71, D-72, D-73, D-74, D-75, D-76, D-77, D-78, D-27, D-30, D-32, D-33, D-34, D-48, D-60]
blocked_by: []
---

# AI Plan Score: a separate AI scoring of the Business Plan

## Goal

A new dashboard route, **AI Plan Score**, that scores how solid a team's Business Plan is, with an AI decision engine that runs from the first field to the last and shows every decision it takes. It is clearly separate from the deterministic app: the Quick Check stays the only calculation (D-27), and the existing checklist, renamed **Pitch completeness**, keeps counting filled fields only (D-74). The score is an AI opinion on the quality of the written plan, never a feasibility verdict.

Owner decisions of 2026-10-24 (D-71 to D-78, [owner decisions](../notes/2026-10-24_owner-decisions.md)):

| | Decision |
|---|---|
| Decisions | **Jev only** (`typesafe-ai/jev-1.14.0`, AI SDK `experimental_decide`) takes every decision: field levels, gates, branches. |
| Text | The short report and the improvement suggestions come from a **model the user picks** (any AI Gateway language model; curated list plus a custom id). The text model never changes a number. |
| Key | **Bring your own key**: the user's Vercel AI Gateway key, used straight from the browser through the Gateway API v4 (CORS checked live on 2026-10-24 for `/v4/ai/*` and `/v1/credits`, also from a localhost origin), kept **in memory only** for the open tab. Nothing passes through our servers. |
| Visibility | **Live everywhere** now: linked in the sidebar in production; the AI page and the Privacy Policy describe it (EN, DE draft under D-44); the dashboard CSP adds `https://ai-gateway.vercel.sh` (extends D-48). |
| Result | Saved **in the project** (schema v3, system-managed `aiScore` section): exported and imported with it, marked AI-generated, flagged outdated once a scored field changes. |
| Dimensions | What makes a business plan **solid**, not the hackathon jury: the provider's own study first (ALG-04 aspects for successful implementation, ALG-05, ALG-09, ALG-10), then established literature (method file). |
| Suggestions | **On demand**, for weak fields only. |
| Seed data | 6 reference cases (3 real Vienna anergy projects, 3 fictional anchor-building cases), one weak, one middling and one strong plan per group, with verified references: on the start screen (last, collapsed, D-78) and in the public docs. |

## The method in one screen

Details, rubric texts, gates, weights and sources: [PLAN-AI-SCORE-01 method](2026-10-24_ai-score-01_method.md).

1. **Turn 0, no AI.** Which fields are filled; empty fields score 0 with certainty and are never sent. The Quick Check verdict, when the module is on and complete, enters as a deterministic signal.
2. **Turns 1 to 4, one Jev call per Business Plan step** (opportunity, business logic, reality check, implementation). Shared state: the plan's texts (all steps, so cross-field judgements work), the earlier turns' decisions and the Quick Check signal. Questions:
   - one **score** question per filled field on a 5-level evidence scale (0 missing or off-topic, 1 vague, 2 specific, 3 quantified, 4 evidenced or validated), with the field's own "what good looks like";
   - **gates**: yes/no questions across fields (for example: who owns source, network and heat pumps; an anchor customer; a deal-breaker with a validation);
   - **branches**: choice questions whose answer selects the next turn's follow-up gate (anchor type, main heat source, ownership model).
3. **Aggregation, no AI.** Jev returns a probability per level, so each field has an expected level and a spread. Dimension score = mean of its items; AI Plan Score = weighted mean × 100, with ± one standard deviation from the distributions. Label: Early < 40 ≤ Promising < 70 ≤ Solid; a failed must-have gate (a cap at level 2) keeps the plan below Solid. Shown rounded to 5 points with the band in whole points.
4. **Report, chosen model.** From the numbers only: a headline, a short summary, strengths, gaps, next actions, each pointing to fields.
5. **Suggestions, on demand, chosen model.** For judgements below level 2 and gates that failed or stayed unclear: one to three general, feasible improvements each.

## Architecture

```
core (no AI imports)                         AI layer
lib/project/schema/ai-score.ts  ◀── writes ── lib/ai/plan-score/   pure: rubric, gates, flow, state, questions,
  (schema v3, data only)                       │                 decide-turn (injected model), aggregate,
lib/business-plan/ai-score-status.ts           │                 report + suggestions (injected model), run()
  (fingerprint, outdated: pure)                │
BP header: AiScoreBadge (reads data)          lib/assistant/gateway/  browser: key in memory, createGateway,
sidebar: "AI Plan Score" entry                 │                      credits check, models, error codes
                                              app/[lang]/(dashboard)/dashboard/ai-score/  route + UI (agent UI)
```

- `ai-score/` joins `_agent` and `connect` as agent UI in `boundary.test.ts` and the ESLint rule.
- The store gets one additive action, `setAiScore(projectId, result)`: it writes the system-managed section (like `provenance`, never a registry field, never patchable).
- Dictionary area `ai-score` (EN + DE), loaded by the route only.

## Steps

1. Plan, method, decisions (this file, the method file, D-71..D-78).
2. Start screen: examples last and collapsed (D-78).
3. Schema v3 `aiScore` + migration + store action + fingerprint (core).
4. Engine `lib/ai/plan-score/` with tests against `Experimental_DecisionMockModelV4` and `MockLanguageModelV4`.
5. Gateway client `lib/assistant/gateway/` (memory key, credits check, curated models, error mapping).
6. Route UI: key and model, run with live flow graph, score dial with band, dimension radar, field list with probability bars, gates and branches, report, suggestions, "How we score" (D-33), sources.
7. Business Plan: "Pitch completeness" rename (copy only, EN + DE, docs) and the AI Plan Score badge, bolder, before it (step header and top of the completeness panel; a tile on the overview and a line in the report); sidebar entry.
8. Reference cases (research sub-agent dossier): example definitions, start-screen group, docs page with verified references; external links only from a verified registry.
9. Legal texts (AI page 1.2, Privacy Policy 1.3, Cookie Policy 1.3; DE drafts under D-44), CSP, public docs page "AI Plan Score".
10. `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, e2e for the start screen and the new route, note, push.

## Verification

All checks green; boundary test green with the new agent UI folder; the route works with a mocked Gateway in unit tests and with the owner's key in the browser (owner test, D-71). Every reference link opened and every DOI resolved on 2026-10-24 (research notes).
