---
id: PLAN-LANDING-MOBILE-00
date: 2026-10-25
status: done
challenge: [quick-check-tool, business-models]
covers: [DESIGN-TOKENS, D-16, D-19, D-27, D-32, D-33, D-34, D-48, D-66, D-69, D-71, D-72, D-73]
blocked_by: [PLAN-LANDING-FIX-00]
---

# Landing mobile 00 · A separate phone and tablet landing, desktop untouched

## Goal

Phones (from 320 px) and tablets get their own, simpler landing page: one column on phones, a two-column rhythm on tablets, large tap targets, short copy, light scroll-reveal, no hover-only interactions, no horizontal scroll and none of the desktop's scroll and 3D machinery. The desktop version (`app/[lang]/(website)/_components/Home.tsx` and everything under it) stays exactly as PLAN-LANDING-FIX-00 left it, pixel for pixel, at and above its breakpoint.

Owner's words: "make a SEPARATE mobile friendly version of the landing page! keep simple and do not touch the desktop version, all separate, create a simpler, mobile friendly and tablet break point version without touching the desktop."

## Where the desktop starts: 1024 px

The desktop CSS (`landing.css`, `story.css`, `ai-score-story.css`) degrades in four steps (1199, 1100, 899, 767 px) and PLAN-LANDING-FIX-00 audited and verified it at 1440, 1280 and **1024** px; its e2e spec (`e2e/landing.spec.ts`) loads `/en` at 1024 px and expects the desktop header nav on one line. DESIGN-TOKENS §7 lists 1024 among the verification widths. So the desktop version owns `min-width: 1024px` and is not changed there, including its 1199 and 1100 px rules. Below 1024 px the new version shows:

- **phone**: 320–767 px, one column;
- **tablet**: 768–1023 px, portrait tablets and small landscape tablets, two columns where it helps.

Baseline screenshots of the desktop before any change (scratchpad `landing-mobile/baseline`): 1440 × 900 and 1280 × 800, full page, EN, in three modes: reduced motion, with motion, and without WebGL (the 3D scene then shows its static SVG fallback). Two runs of the WebGL version differ in about 0.5 % of their pixels run to run (the software-GL scene is not deterministic frame to frame); two runs without WebGL are identical, so that mode carries the pixel proof, and the WebGL mode is reported against its own noise.

## Build

1. **Switch at the page level** (`page.tsx` → `_components/LandingSwitch.tsx` + `landing-switch.css`). The server renders both trees; CSS shows one: `.landing-desktop { display: none }` and `.landing-mobile { display: block }`, from 1024 px `.landing-desktop { display: contents }` (no box of its own, so the desktop layout is the same as without the wrapper) and `.landing-mobile { display: none }`. Nothing reads the window during render: the switch's `useSyncExternalStore` returns `both` on the server and during hydration and the media query's answer afterwards, when the hidden tree is unmounted. Each tree sits in its own `<Suspense>` boundary, so React hydrates it after the page shell; the hidden tree is removed by that first client render before its turn comes, and none of its effects runs: on a phone the 3D scene never imports three.js, opens no WebGL context and no desktop observer is created. Crossing 1024 px (a tablet turned to landscape) remounts the other tree with fresh state. Desktop-side change: none beyond the wrapper; `Home.tsx` and its children and styles are not edited.
2. **Mobile landing** in `_components/mobile/` (one component per file, co-located tests, `mobile.css` as its only stylesheet, classes prefixed `m-`, ids prefixed `m-` so both trees can share one document before hydration):
   - `MobileLanding` (root, `useMobileReveal` for `[data-m-reveal]`; reduced motion shows everything at once, and without JavaScript nothing is hidden because the hide rule needs `data-ready` on the root).
   - `MobileHeader`: brand, "Get Started" (44 px), menu button (44 px) that opens a panel with the five chapters (`#m-system`, `#m-quick-check`, `#m-business-models`, `#m-ai-score`, `#m-methodology`) as 56 px rows and the language switch; Escape and a tap outside close it.
   - `MobileHero`: eyebrow, the three-line title, the intro, "Discover the system"; `MobileDistrict`, a static inline SVG district (ground, buildings, the cyan and orange loops; the flow dashes move only without reduced motion), with the legend (cooling, heating, 5–25 °C); the gateway with the two tools as large links.
   - `MobilePromise` (`#m-system`): the promise and the three audiences; `MobileTools`: the three rows (01, 02, AI).
   - `MobileQuickInputs` (`#m-quick-check`): the three scenarios as 44 px buttons and the three parameters as bars with their level words; `MobileAssessment`: the three states as buttons, the result with icon, summary and three reasons; `MobileReport`: one static report card and "Continue to Business Models".
   - `MobileUseCases` (`#m-business-models`): the three use cases as a segmented control with description, focus and the input categories; `MobileCanvas`: the six blocks (two columns from 480 px) and the four roles as a list; `MobileRealityCheck`: the three risks as native `<details>` and the rule; `MobileScalability`: three items; `MobileImplementation`: the four steps and the link to the AI chapter.
   - `MobileAiScore` (`#m-ai-score`): kicker, title, body, the three facts, the two links; `MobileAiConsole`: the example run with the desktop's data and playback hook (`sections/aiScoreExample.ts`, `sections/useAiScorePlayback.ts`, imported, not changed) in simpler markup: four turn rows with their cells, one decision each, the score with band and level, the seven dimensions; plays when it scrolls into view, final state at once with reduced motion, Replay.
   - `MobileMethodology` (`#m-methodology`): the five rows, the boundary; `MobilePartners`: "Brought to you by" as a still row of the placeholders (each opens the existing `PartnerDialog`); `MobileGetStarted` (`#m-get-started`): the primary action (56 px) to the dashboard and the docs link; `MobileFooter`: brand, open source, the three links, back to top, `LegalLinks`.
3. **Copy**: every section reuses `landing.json`; the only new copy is the top-level key `mobile` (EN and DE): the label and the description of the static district visual.
4. **Styles**: tokens from `globals.css` only, radius 0, cyan for the Quick Check and orange for the Business Plan and risk, Archivo and IBM Plex Mono, 16 px body and 12 px mono labels, 44 px targets, `prefers-reduced-motion` turns the reveal, the flow dashes and the bar transitions off; `overflow-x: clip` on the root as a last guard.
5. **Tests**: a test next to every component; `LandingSwitch.test.tsx` (server snapshot renders both, client snapshot one); `page.test.tsx` follows the switch (the page now renders the switch with `Home` as its desktop tree); `e2e/landing-mobile.spec.ts`: at 320 × 640, 390 × 844 and 768 × 1024 the mobile version shows and the desktop tree is gone, the calls to action lead to the dashboard and the docs, the menu reaches the chapters, the example run plays, no horizontal scroll after scrolling through, axe clean (EN and DE), no canvas and no three.js request; at 1024 and 1440 the desktop shows and the mobile tree is gone.
6. **Proof that the desktop is untouched**: after the change, the same screenshots as the baseline; `compare.js` (pixel by pixel, Playwright's bundled PNG decoder) on the no-WebGL pair must report 0 differing pixels at 1440 and 1280; the desktop tree's `outerHTML` after hydration and a scroll pass must be byte-identical to the baseline dump; the WebGL pair is reported against the baseline's own run-to-run noise. `git diff` of the desktop files is empty.
7. Plan, note, `pnpm lint && pnpm typecheck && pnpm test`, commits step by step.

## Decisions taken for the owner (to review)

- **D-LM-1** The desktop starts at 1024 px (see above); tablets in portrait and small landscape tablets below 1024 px get the new version, 1024 px landscape tablets the desktop one.
- **D-LM-2** Both versions are server-rendered and switched by a CSS media query; after hydration the hidden tree is unmounted (and never hydrated, thanks to its own Suspense boundary), so phones pay nothing for the 3D scene. The HTML carries both versions once (about the size of a second landing page in HTML, no extra JavaScript).
- **D-LM-3** The mobile hero shows a static, lightly animated SVG district instead of the 3D scene: no WebGL, no three.js, no pointer-driven camera on touch devices.
- **D-LM-4** Simplifications of the desktop's interactions: no flow-reverse control, no report tilt, no online/PDF toggle (one report card), the risks as native details/summary, the partner strip stands still (same dialog), the allocation roles as a list instead of tabs.
- **D-LM-5** The mobile version keeps every chapter and the chapter order of the desktop story, and the same copy keys, so a copy change reaches both versions. New copy only under `landing.mobile`.
- **D-LM-6** The mobile AI console reuses the desktop's example data and playback hook by import only; its markup and CSS are its own.
- **D-LM-7** Ids of the mobile tree are prefixed `m-`; the mobile nav and the story links use them. Deep links to the desktop ids (`/#ai-score`) still work on desktop; on a phone they land on the top of the page.
- **D-LM-8** (added while building) Grids inside panels follow the panel's width with `@container` queries, not the viewport's: in the tablet split layout a panel is about 360 px wide at 768 px, and the viewport-based grids overflowed there.

## Verification

Screenshots after the change (scratchpad `landing-mobile/final2`): desktop 1440 × 900 and 1280 × 800 (pixel compare and DOM compare against the baseline); mobile 320 × 640, 375 × 812, 390 × 844, 430 × 932, 768 × 1024, 820 × 1180 (EN and DE), full page and by viewport; no horizontal overflow at any of them; axe clean; the e2e spec green against a production build.

Done 2026-10-25: see [the note](../notes/2026-10-25_landing-mobile-00.md) for what was built, the checks (0 differing pixels without WebGL at 1440 and 1280, the DOM identical except React's `useId`), the hydration race found and fixed, and the decisions D-LM-1 to D-LM-8.
