---
id: PLAN-LANDING-FIX-00
date: 2026-10-25
status: in-progress
challenge: [quick-check-tool, business-models]
covers: [DESIGN-TOKENS, D-16, D-19, D-27, D-32, D-33, D-34, D-48, D-66, D-69, D-71, D-72, D-73, D-78]
blocked_by: []
---

# Landing fix 00 · Visual and code audit, fixes, AI Plan Score chapter

## Goal

The landing page (`app/[lang]/(website)`) looks precise and on brand at 1024 px and wider: every callout points at the thing it names, no decorative affordance lies, the type scale and spacing are one system, and the copy carries no filler. The story gets one more chapter after the Business Plan part, the **AI Plan Score**, with the same scroll-driven storytelling and a small animated visual. Smaller widths must not break (a separate mobile version follows in another task).

Owner's words: "some parts are not looking good and too AI slop … some stuff are not pointing on the right places or are too messy. fix them all. there is an AI evaluation tool added also, I want you to add a section for that as well keeping the story and animated going down."

## Audit (2026-10-25, `/en` and `/de` at 1440 × 900, 1280 × 800, 1024 × 768; screenshots in the scratchpad, "before")

Severity: **A** wrong or misleading, **B** messy or off-system, **C** polish.

| # | Where | Problem | Sev |
|---|---|---|---|
| H-1 | Hero, `.scene-annotation--top/--side` (`Hero.tsx`, `landing.css`) | "Bidirectional flow" and "Local sources" are placed with viewport percentages (`top: 31%; right: 13%` and `top: 54%; right: 3.2%`). Their pointer lines end in empty space: the 3D district moves with the chapter pose, the pointer and the viewport, so the dots never sit on a pipe or a source node. At 1280 the "Local sources" dot floats above a building roof, at 1440 it points at the viewport edge. This is the owner's "not pointing on the right places". | A |
| H-2 | Hero, scene fallback | The same callouts also show over the SVG fallback (no WebGL), where there is no network at those positions. | A |
| H-3 | Hero HUD, ≤ 1199 px | "Interactive district · low-temperature network" wraps to two lines and the orange `+` sits half a line above the text. | B |
| H-4 | Hero, `.hero__intro` | "Discover the system" hangs to the right of the paragraph, bottom-aligned, on its own underline, so it reads as a caption of the scene rather than the next step of the copy. | C |
| N-1 | Header nav | No entry for the AI Plan Score (new chapter). At 1024 px the nav already fills the width (brand 154 px, nav 279–727 px, switch and CTA from 752 px), so a fifth item needs tighter link padding at ≤ 1199 px. | B |
| T-1 | Tools section, `.tool-chapter` | Two chapters only; the AI Plan Score belongs to the overview so the story announces it before it arrives. | B |
| U-1 | Use cases, `.business-inputs` | Eight underlined mono words in a cloud ("Customer segments Heating + cooling needs Heat sources …") under the diagram: a keyword wall without a label or order. | B |
| U-2 | Use cases, `.use-case-switcher` buttons | Each has an `ArrowUpRight` icon, the mark the page uses for links; these are state buttons. The affordance lies. | A |
| I-1 | Implementation, `.implementation-path li` | Every step ends with an `ArrowUpRight` icon in a 24 px column; the steps are not links. Same lie, four times. | A |
| R-1 | Reality Check, `.risk-console` | The third row's kicker "Potential deal-breaker" sits directly above the footer block whose label is also "Potential deal-breaker": the same words twice, one above the other. | B |
| L-1 | Implementation link | "Check the methodology" → `#methodology` skips the new AI chapter; the chain of story links must stay one step at a time. | B |
| M-1 | Methodology, `.screening-boundary` (EN) | "Fast initial screening not a full feasibility study." has no comma (DE has one): `boundaryLead` lacks the trailing comma. | B |
| M-2 | Methodology ledger | Four rows; nothing says that the AI score is a separate opinion while the Quick Check stays the calculation (D-27), the one credibility statement the new chapter needs. | B |
| G-1 | Get started, secondary link | "Explore Business Models" scrolls back up to `#business-use-cases` from the last chapter: the end of the story points backwards. | B |
| G-2 | Get started, `h2` | Its own type: stretch 74 %, weight 600, tracking −0.06em, line-height 0.88, `clamp(4rem, 8vw, 6rem)`; every other chapter title is `.section-title` (76 %, 590, −0.055em, 0.94). Two display scales on one page. | C |
| S-1 | Scalability, `.replication-ledger` | `margin-top: 34vh` leaves a third of the viewport empty between copy and ledger; the 3D replication layer is meant to show there but sits centre-right, so the left half reads as a hole. | C |
| C-1 | Canvas blocks | `min-height: 175px` with two lines of text: a third of each block is empty. | C |
| Q-1 | Quick Check inputs console | Fine. The sliders, level labels, scenario buttons and the "Illustrative inputs only" note follow DESIGN-TOKENS §6. | – |
| A-1 | Assessment workbench | Fine (three states, icon + colour, example label, boundary note). | – |
| P-1 | Partners strip | "Your Company" × 3 placeholders are the owner's decision (D-69); out of scope. | – |
| F-1 | Footer | Both "Quick Check" and "Business Models" link to `/dashboard`; the footer belongs to another task (footer link), not touched here. | – |

Checked and clean: no horizontal overflow at the three widths (`scrollWidth == clientWidth`); no console errors; all colours are tokens (cyan, orange, Ink, Paper); radius 0 everywhere; focus rings visible; `prefers-reduced-motion` handled in `landing.css`, `story.css`, `useLandingPage.ts` and the scene; the 3D scene loads after hydration; copy comes from `landing.json` only.

## Fix plan

1. **Callouts that follow the scene (H-1, H-2).** `districtWorld.ts` gets an `anchors` input: named points in district space (the central crossing node for "Bidirectional flow", the orange corner node at (5.35, 0.03, −3.75), next to the warm light, for "Local sources"). Each frame while the overview chapter is active it projects them through the camera and writes `--anchor-<id>-x/-y` (px) and `--anchor-<id>-on` (0/1, off when the point is behind the copy column, outside the viewport or the chapter changed) to the scene container. The hero callouts become `position: fixed` labels whose dot sits on the anchor (`translate(-100%, -50%)`), with a short opacity transition; without WebGL (fallback) nothing is written, so they stay hidden. Still `aria-hidden`, still hidden ≤ 1199 px.
2. **Hero HUD (H-3):** the status line gets `text-wrap: balance` and the cross aligns with the first line; the intro link (H-4) moves under the paragraph like every other `.story-link`.
3. **Nav and overview (N-1, T-1):** "AI Plan Score" in the header nav (`#ai-score`), link padding 11 px at ≤ 1199 px; a third `.tool-chapter` row "AI Plan Score" (index "AI", neutral colour, meta "four turns · seven dimensions · an opinion") after the two tools.
4. **Honest affordances (U-2, I-1):** the use-case buttons lose the arrow and get an index on the right plus a 2 px orange left bar when selected; the implementation steps lose the arrow column.
5. **Use-case inputs (U-1):** one labelled line, `INPUTS` + the eight items separated by middle dots, mono 12 px, in a thin bordered row under the diagram.
6. **Reality Check (R-1):** the footer block label becomes "Why it matters" / "Warum das zählt"; the text stays.
7. **Copy and links (L-1, M-1, M-2, G-1):** implementation link → "Continue to the AI Plan Score" (`#ai-score`); EN `boundaryLead` gets its comma; a fifth methodology row "Separate AI opinion"; the closing secondary link becomes "Read the documentation" → `/{lang}/docs`.
8. **One type scale (G-2, S-1, C-1):** the closing `h2` uses `.section-title`; `.replication-ledger` margin 34vh → 22vh; canvas blocks `min-height` 175 → 150 px.
9. **AI Plan Score chapter** (`sections/AiScoreStory.tsx` + `ai-score-story.css` imported by `story.css`'s neighbour `Home.tsx`), `id="ai-score"`, `data-chapter`, between Implementation and Methodology:
   - Copy (left, orange kicker "AI Plan Score · Business Plan"): title "Score the plan.\n*See every decision.*"; one short body; three facts in a ledger: "Four turns" (Jev decides every field, gate and branch from the first field to the last), "Your key, your model" (Vercel AI Gateway key in memory only; a text model of your choice writes the report and on-demand suggestions), "An opinion, not a calculation" (the Quick Check stays the calculation). Links: "Try the AI Plan Score" → `/{lang}/dashboard/ai-score`, "How we score" → `/{lang}/docs/ai-plan-score`.
   - Visual (right): a console that plays when it scrolls into view (IntersectionObserver; reduced motion shows the final state at once). Four rows, one per turn (Opportunity 8, Business logic 8, Reality check 5, Implementation 6 cells = the 27 judgements), the cells light up to their evidence level (0–4, five steps of Paper to orange); each turn also shows one decision chip (branch "Main heat source → Groundwater", gate "System boundary → pass", gate "Deal-breaker with a validation → unclear", gate "Decision gate → pass"); at the end a score line "62 ± 6 · Promising" with the band Early < 40 ≤ Promising < 70 ≤ Solid (the engine's `labelOf`, `PROMISING_FROM`, `SOLID_FROM`) and the seven dimension bars. Labelled "Example run · illustrative" (DESIGN-TOKENS §6). Numbers through `lib/i18n/format`. A "Replay" button restarts it.
   - Scene: pose `ai-score` (high, calm, scale 0.72) and the business layer (six nodes around one core: the "experts at one table") stays on through this chapter.
10. **Dictionaries:** EN and DE complete for every new key (`header.nav.aiScore`, `product.tools.aiScore`, `businessModels.implementation.link`, `businessModels.reality.whyLabel`, `aiScore.*`, `closing.methodology.rows[4]`, `closing.getStarted.secondary`); DE reuses "KI-Plan-Score", "Businessplan", "Entscheidungsmodell".
11. **Tests:** unit tests next to the new section and for the anchor projection helper; `Home.test.tsx` gains `ai-score`; `Closing.test.tsx` follows the new secondary link; e2e `e2e/landing.spec.ts` (new chapter visible, its two links, the nav entry, no overflow at 1024/1280/1440) plus the existing `foundation`, `partners`, `legal`, `journey` specs.
12. Re-screenshot at the three widths, compare, iterate. `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, note, commits step by step.

## Decisions taken for the owner (to review)

- D-LF-1: the callouts follow the 3D scene instead of being removed; they stay decorative (`aria-hidden`) and hidden below 1200 px and without WebGL.
- D-LF-2: "AI Plan Score" joins the header nav and the overview rows; the hero gateway keeps "Two tools": the score is part of the Business Plan, not a third tool.
- D-LF-3: the closing secondary link goes to the public docs (`/docs`) instead of scrolling back up.
- D-LF-4: the AI chapter's example run is fixed illustrative data (62 ± 6, Promising), labelled as such; the landing never imports `lib/ai` (boundary, PLAN-AGENT-00).
- D-LF-5: the Reality Check footer label is reworded ("Why it matters"), the text is kept.

## Verification

Screenshots before/after at 1440, 1280, 1024 (EN, DE); no overflow at 320–1440; axe clean on `/en` (partners spec); reduced motion shows the AI console's final state; all checks green.
