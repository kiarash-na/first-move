---
id: PLAN-PRESENTATION-00
date: 2026-10-25
status: done
challenge: [quick-check-tool, business-models]
covers: [BM-SCOPE-02, BM-SCOPE-08, QCT-SCOPE-04, QCT-SCOPE-11, QCT-SCOPE-13, DESIGN-TOKENS, D-32, D-33, D-48, D-52, D-55, D-66, D-68, D-71, D-74, D-75]
blocked_by: []
---

# Presentation · ten slides at /{lang}/presentation

## Goal

The owner asked for a presentation route with a simple layout, no more than ten slides, **extremely little text**, premium animation and meaningful interactions, linked from the footer. It explains the name, the two tools, the AI engine (with a proof on data whose outcome is known, without leaking it), the two email addresses, two concepts (System 1 models for security, self-healing apps), future features (a 3D building scan plus four more), what First Move cost to make and costs to run, the offer to work together, and a last slide with the owner's link page, an on-brand QR code and "powered by /1Slash".

## Requirements covered

The slides answer the jury's questions (BM-SCOPE-08, QCT-SCOPE-11) and say who the tools are for (QCT-SCOPE-13); slide 2 maps each criterion to the slide that answers it. The Quick Check slide shows the provider's method run deterministically (QCT-SCOPE-04). No requirement text changes; no new methodology.

## Slides

| # | Id | Interaction |
|---|---|---|
| 1 | `why` | "Make the first move" draws the knight's move of the mark (D-68), then the network it opens and five buildings; flows run both ways in the loop. |
| 2 | `challenge` | Pick a jury criterion, read where the deck answers it, jump there. |
| 3 | `quickCheck` | The real Quick Check result of an illustrative example; "Run again" loads the engine in the browser and compares the result fingerprint. |
| 4 | `businessPlan` | Open the four steps (BM-STEP-01..04); an illustrative Pitch completeness meter (D-74) counts them; a link to the slide that judges. |
| 5 | `aiEngine` | AI Plan Score (D-71, D-75) as experts at one table; replay a recorded blind test, then reveal what happened, with sources. |
| 6 | `emails` | agent@ and human@ as mail links; agent@ marked "not live yet". |
| 7 | `systemOne` | Send a sample email into a scripted, offline System 1 demo with the guard's real thresholds (D-52, D-55). |
| 8 | `selfHealing` | "Break something": a token runs tracked → reproduced → fix proposed → human approves. Labelled a concept. |
| 9 | `nextMoves` | Five cards, the 3D scan first (a CSS 3D wireframe under a scan plane); open one at a time. |
| 10 | `contact` | Cost figures count up; collaboration; /1Slash; the owner's link as a QR code. |

## Steps

1. `lib/presentation/`: slide order and pure deck logic (`slides.ts`: hash, keys, swipes), boot script, QR matrix and paths, guard demo data, Quick Check demo, fingerprint, facts, the blind-test case and the summary of its recorded run.
2. Dictionaries: new area `presentation` (EN, DE) in `lib/i18n/dictionaries.ts`; footer labels as new top-level keys at the end of `legal.json` and `landing.json`.
3. Route group `app/[lang]/(presentation)/` with its own root layout (dark, boot script, cookie notice) and `presentation/page.tsx` (static for both locales).
4. Deck components in `presentation/_components/` (deck, bar, controls, hooks, heading, count-up, CSS) and one file per slide part in `_components/slides/`.
5. Footer links: `components/site-footer/` (legal links take several extra links) and the landing footer (`Closing.tsx`).
6. Blind test: `lib/assistant/plan-score/blind-test.live.test.ts`, skipped unless switched on, ran twice against the AI Gateway and wrote `lib/presentation/blind-test/result.json`.
7. Tests: a unit test next to every unit; `e2e/presentation.spec.ts`.
8. Screenshots of every slide at 1440 × 900 and 390 × 844 (plus 320 px overflow check), EN and DE.

## Open questions this depends on

None in `OQ-xx`. Owner items are listed in the [note](../notes/2026-10-25_presentation.md).

## Verification

`pnpm lint && pnpm typecheck && pnpm test && pnpm build`, `E2E_PORT=3347 pnpm test:e2e e2e/presentation.spec.ts` (plus `legal`, `responsive`, `foundation`), a screenshot pass of every slide.
