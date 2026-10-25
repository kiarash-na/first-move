---
id: NOTE-2026-10-25-ai-score-followups
date: 2026-10-25
author: Claude (cloud session, follow-up step of the orchestrated run)
relates_to: [PLAN-AI-SCORE-00, PLAN-AI-SCORE-01, PLAN-PRESENTATION-00, D-32, D-33, D-71, D-77, D-81]
---

# AI Plan Score follow-ups: output caps, formal German, label rule, run hint, slide 5 sources

Five follow-ups on the AI Plan Score engine (`lib/ai/plan-score`), its route (`app/[lang]/(dashboard)/dashboard/ai-score`) and the presentation, from the open questions of the [AI Plan Score note](2026-10-25_ai-score.md#open-questions-for-the-owner) (3, 4) and the [presentation note](2026-10-25_presentation.md#open-questions-for-the-owner) (1, 5). One commit per item.

## What changed

| # | What | Where |
|---|---|---|
| 1 | **Output caps for thinking models.** The report allowed 1,500 output tokens and the suggestions 2,500. A model that thinks before it answers counts its reasoning against that cap, and German takes more tokens than English, so the German report of the blind test ended with finish reason "length" and no object (`AI_NoObjectGeneratedError`). Now `REPORT_MAX_OUTPUT_TOKENS = 6,000` and `SUGGESTIONS_MAX_OUTPUT_TOKENS = 8,000`. The stored lengths (`AI_SCORE_LIMITS`: headline 160, text 900, item 320 characters) still cut every text. A thinking mock (`test-utils/mock-text.ts`, `mockThinkingText`) counts reasoning against the call's cap and cuts the answer where the cap falls. Tests: a long German report and long German suggestions within the caps are accepted and cut to the stored limits; the same report under the old 1,500 cap fails as in the blind test. The cost estimate's "up to N output tokens" reads the engine's cap, so it now shows the higher bound. The live blind test drops its middleware and uses (and records) the engine's caps. | `report.ts`, `suggest.ts`, `report.test.ts`, `suggest.test.ts`, `test-utils/`, `setup/cost.ts`, `lib/assistant/plan-score/blind-test.live.test.ts` |
| 2 | **German texts say "Sie".** The text model's German blind-test suggestion said "ihr". The language instruction of every text call is now `LANGUAGE_RULE`: it names the language and, for German, asks for "Sie", "Ihr", "Ihnen" and forbids "du", "dich", "dir", "dein" and the informal plural "ihr", "euch", "euer". | `text-input.ts`, `text-input.test.ts`, report and suggestion prompts |
| 3 | **The label follows the shown score (D-81, method 1.1.0).** `aggregate` labels `displayScore(score, sd).score`, the number every view shows, so a plan at 68 shows 70 and is Solid (it was Promising). A failed must-have gate still keeps a plan below Solid. `METHOD_VERSION` is 1.1.0. Every number stays comparable; only the label of a stored score from 37.5 to 39.9 or 67.5 to 69.9 moves up one step. The landing's illustrative run labels its shown score too (same result, 60). | `aggregate.ts`, `run.ts`, tests, method file (rule, known limit, changelog), `content/docs/{en,de}/ai-plan-score.mdx`, `dictionaries/{en,de}/ai-score.json`, owner decisions, `aiScoreExample.ts` |
| 4 | **"A run is in progress."** During a run the report and suggestion buttons of the saved result stay disabled, but their hint now says "A run is in progress. You can write with AI again once it has finished." (DE "Eine Bewertung läuft. Sobald sie abgeschlossen ist, können Sie wieder mit KI schreiben.") instead of asking for a key. `ResultActions` gains `running`; the new `AiHint` picks the reason for both buttons. | `_components/types.ts`, `run/use-text-actions.ts`, `results/ai-hint.tsx`, `report-panel.tsx`, `suggest-button.tsx` |
| 5 | **Slide 5 links every source.** The link now goes to the section of the AI Plan Score page that lists and links every source: `/{lang}/docs/ai-plan-score#sources` (DE `#quellen`), the id `headingId` gives the `## Sources` / `## Quellen` heading. The heading text is the new copy key `slides.aiEngine.sourcesSection`, and the label is "Every source, linked" again (DE "Jede Quelle, verlinkt"), as the presentation note proposed. A unit test checks that the anchor names a `##` heading of the page in both languages and that this section links every reference of the registry; the e2e opens the link and finds the heading in view. | `ai-engine-slide.tsx`, its test, `dictionaries/{en,de}/presentation.json`, `e2e/presentation.spec.ts` |

## Decisions and deviations

- **D-81** is an orchestrator decision on the owner's behalf, recorded as such in the [owner decisions](2026-10-24_owner-decisions.md); the owner confirms it.
- **Minor version step.** The orchestrator asked for 1.1.0. The method's proposed (unconfirmed) rule would raise the major number for a threshold change; the changelog says why the step is minor (every stored number stays comparable, only labels near a threshold move) and leaves the step to the owner's confirmation with D-81.
- **The blind test stays as recorded.** `result.json` was recorded with method 1.0.0, the old caps lifted to 8,000 by middleware, and the German suggestion in "ihr". Its score 54 shows 55 and is Promising under both label rules, so `summary.test.ts` now accepts the same major method version when the recorded label is the one the current rule gives, instead of the exact version. A new live run (owner, with a Gateway key) would record 1.1.0, the engine's caps and formal German.
- **The e2e fixture** keeps its saved score of method 1.0.0: 54.3 shows 55 and is Promising under both rules, and a saved score keeps the method it was made with.
- **The summary line under the scale** now reads "Shown rounded to 5 points from 68." instead of "The label uses the unrounded score". It is true for scores of both methods; "How we score" states the rule.
- **The cost estimate** prices the report at its cap (6,000 output tokens, was 1,500), so its rough figure for the text model goes up; it was and stays an upper bound ("up to").
- **`ResultActions.running`** instead of a reason field: the smallest change, since `canUseAi` stays the one switch for the buttons and the hint only needs to know why.

## How it was verified

Run in the worktree on top of `dev` at f237f47 (2026-10-25):

| Check | Result |
|---|---|
| `pnpm gen:knowledge` | regenerated `lib/ai/knowledge/generated/{en,de}.json` after the docs change, committed with item 3 |
| `pnpm lint` | exit 0, no findings |
| `pnpm typecheck` | exit 0 |
| `pnpm test` | 805 files passed, 3 skipped; 3627 tests passed, 14 skipped |
| `pnpm build` | exit 0 |
| `E2E_PORT=3431 pnpm test:e2e e2e/ai-score.spec.ts e2e/presentation.spec.ts` | 22 passed (ai-score 4, presentation 18, of which 2 new: slide 5 opens the Sources section in EN and DE) |

The live blind test (`blind-test.live.test.ts`) needs a Gateway key and was not run; it compiles and is skipped without the key, as before.

## Open questions for the owner

1. **Confirm D-81 and the version step** (1.1.0 minor, see the method's changelog).
2. **The scale picture near a threshold.** The results' scale still marks the unrounded score with its band, as the range text beside it says. Near a threshold the mark can sit just below the zone the label names: a plan at 68 is marked in the Promising zone and labelled Solid (shown 70). Move the mark to the shown score (and accept a band that is then off-centre, or outside it for a very narrow band), or keep it?
3. **Saved scores of method 1.0.0** keep their stored label, so a saved 68 still reads "70, Promising" until the plan is scored again. Relabel old scores on display, or keep them as saved?
4. **Re-record the blind test** with a Gateway key, so slide 5 replays method 1.1.0 with the engine's own caps and formal German (`PRESENTATION_LIVE_BLIND=1`, see the live test).
5. **`fit` keeps a trailing space** before "…" when the last space falls just below half the limit (for example "Prüfen Sie die …"). Cosmetic; seen while writing the German tests and left as it is.
