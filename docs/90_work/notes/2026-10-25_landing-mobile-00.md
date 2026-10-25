---
id: NOTE-2026-10-25-landing-mobile-00
date: 2026-10-25
author: Claude (landing mobile sub-agent, overnight run O-task "separate mobile landing")
status: done
relates_to: [PLAN-LANDING-MOBILE-00, PLAN-LANDING-FIX-00, DESIGN-TOKENS, D-16, D-19, D-32, D-33, D-66, D-69, D-72, D-73]
---

# Landing mobile 00 · A separate phone and tablet landing, desktop untouched

Executed [PLAN-LANDING-MOBILE-00](../plans/2026-10-25_landing-mobile-00_plan.md): phones (from 320 px) and tablets get their own, simpler landing; the desktop story of PLAN-LANDING-FIX-00 stays as it was, pixel for pixel, from 1024 px. Four commits, one per step, on the worktree branch, after the baseline screenshots of the untouched desktop.

Owner's words: "make a SEPARATE mobile friendly version of the landing page! keep simple and do not touch the desktop version, all separate, create a simpler, mobile friendly and tablet break point version without touching the desktop."

## Where the desktop starts

**1024 px** (D-LM-1). The desktop CSS degrades in four steps (1199, 1100, 899, 767 px) and was audited and verified by PLAN-LANDING-FIX-00 at 1440, 1280 and 1024 px; its e2e spec loads `/en` at 1024 px and expects the desktop nav; DESIGN-TOKENS §7 lists 1024 among the verification widths. So the desktop owns `min-width: 1024px` and is not changed there, and the new version shows below: phones 320–767 px in one column, tablets 768–1023 px with two columns where it helps.

## Built

1. **The switch** (`_components/LandingSwitch.tsx`, `landing-switch.css`, `page.tsx`). The page renders both trees; CSS shows one: below 1024 px the mobile wrapper, from 1024 px the desktop wrapper as `display: contents`, so it has no box of its own and the desktop lays out as if the wrapper were not there. Nothing reads the viewport while rendering: `useSyncExternalStore` answers `both` on the server and during hydration and the media query afterwards, when the hidden tree is unmounted. Each tree sits in its own `<Suspense>` boundary: React hydrates a server-rendered boundary after the page shell, at the lowest priority, and the first client render removes the hidden one before its turn, so none of its effects ever runs. Verified in the browser with a probe (patched `IntersectionObserver.observe`, `createElement('canvas')`, the request initiator through CDP): on a 390 px phone no `[data-chapter]` or `[data-reveal]` element is ever observed, no canvas is created, the `.site-shell` is gone after hydration, and no script containing three.js' `WebGLRenderer` is loaded. Crossing 1024 px (a tablet turned to landscape) remounts the other tree with fresh state; the e2e spec turns a tablet both ways.
2. **The mobile landing** (`_components/mobile/`, 20 components, `mobile.css`, classes and ids prefixed `m-`): header with brand, Get Started and a menu (five chapters, language switch, Escape and tap outside close it); hero with the three-line title, the intro, a static SVG district (`MobileDistrict.tsx`: ground, eight buildings back to front, the cyan and orange loops with a crossing, the local source; the flow dashes move only without reduced motion) with its legend, and the gateway to the two tools; the system and the audiences; the three tool rows (01, 02, AI); Quick Check inputs with the three scenarios and the three parameters as bars with level words; the assessment with the three states and the result with its reasons; one static report card; the three use cases as a segmented control with the input categories; the canvas blocks and the four roles; the Reality Check as native `<details>` (first open) with the rule; scalability; the four steps; the AI Plan Score with its three facts, the two links and the example run (the desktop's data and playback hook imported, not changed; its own markup: four turn rows with their cells, one decision each, the score with band and level, the three-zone scale, the seven dimensions; before the run the score shows the empty value and no level); methodology rows, the boundary, the partners as a still row with the same dialog; Get Started; the footer with the legal links.
3. **Reveal and motion**: `useMobileReveal` adds `is-in` to `[data-m-reveal]` blocks as they scroll into view; the hide rule needs `data-ready` on the root, which only the effect sets, so without JavaScript nothing is hidden; with reduced motion everything shows at once and the hero's CSS entrance, the flow dashes and the bar transitions are off.
4. **Layout**: 18 px gutters (32 px on tablets), 44 px tap targets everywhere (menu rows 56, primary 56, partner cards 64), 16 px body and 12 px mono labels, panels as `@container` contexts so the grids inside (scenarios, states, reasons, use cases) follow their own width rather than the viewport's, which matters in the tablet split layout where the panel is about 360 px wide at 768 px. Below 360 px the header's Get Started drops its arrow and the gutters go to 14 px, so "JETZT STARTEN" fits at 320 px.
5. **Copy**: every section reuses `landing.json`; the only new copy is `landing.mobile.hero.visualLabel` and `visualAlt` (EN and DE).
6. **Tests**: a test next to every component (22 files), `LandingSwitch.test.tsx` (server renders both; the client keeps one; hydrating the server HTML on a phone raises no error, drops the desktop tree and never runs its effects), `page.test.tsx` follows the switch; `e2e/landing-mobile.spec.ts` (phone and tablet, EN and DE: the mobile tree shows, the desktop tree is gone, no canvas, no three.js script, the header and closing actions, the menu, the example run and its replay, no sideways scroll; 320 px tap targets; the desktop at 1024 and 1440; a tablet turned both ways; reduced motion; axe with the menu closed and open).

## Proof that the desktop is untouched

- `git diff 8c51dd1..HEAD --stat -- 'app/[lang]/(website)/_components'` lists no desktop file: only `LandingSwitch.*`, `landing-switch.css` and `mobile/` were added; `Home.tsx`, the sections, the scene, `landing.css`, `story.css` and `ai-score-story.css` are byte-identical to the merge base.
- Screenshots of `/en` at 1440 × 900 and 1280 × 800, full page, before and after, in the same Chromium, in three modes (scratchpad `landing-mobile/baseline` and `landing-mobile/after`). Without WebGL (the scene shows its static SVG) two baseline runs are identical, so that mode is the pixel proof: see the checks below. With WebGL the software-GL scene is not deterministic frame to frame (two baseline runs differ in about 0.5 % of the pixels), so that pair is reported against the baseline's own noise.
- The desktop tree's `outerHTML` after hydration and a scroll pass, dumped before and after (57 948 bytes each), compared byte for byte: the only difference is React's `useId` in the brand mark's SVG filter id (`brand-mark-glow-_R_16aupfivb_` → `_R_4paupfivb_`, the id and its `url(#…)` reference), because the tree now sits inside the switch; every other byte is the same, and the id has no visual effect (the pixel comparison is exact).

## Checks (2026-10-25, worktree at 2656ad8 + PLAN-LANDING-FIX-00 + this work)

- `pnpm lint`: clean.
- `pnpm typecheck`: clean (`next typegen && tsc --noEmit`).
- `pnpm test`: 657 files passed, 2 skipped; 3018 tests passed, 7 skipped (the skips are pre-existing). Run on the final tree.
- `pnpm build`: clean; `/[lang]` stays statically prerendered (`/en`, `/de`).
- E2E against the production build (`pnpm build`, `pnpm start --port 3530`, `E2E_PORT=3530`): `e2e/landing-mobile.spec.ts` 11 passed (34 s); `e2e/landing.spec.ts`, `partners`, `foundation`, `start`, `legal` 60 passed (1.4 min), so the desktop specs, the landing footer at 375 px and the cookie notice still hold.
- **Desktop untouched, pixel by pixel** (full page, EN, reduced motion, Playwright's bundled PNG decoder, tolerance 0):
  - without WebGL, 1440 × 900: 0 of 20 979 360 pixels differ; 1280 × 800: 0 of 17 388 800 pixels differ (two baseline runs of that mode are also identical, so the measure is exact);
  - with WebGL (the software-GL scene): 1440 × 900 0.18 % and 1280 × 800 0.58 % of the pixels differ, against 0.50 % and 0.55 % between two runs of the baseline itself; the differences sit in the 3D scene;
  - the DOM dumps as above.
- **Nothing of the desktop runs on a phone** (production build, 390 × 844 and 768 × 1024, EN and DE, CDP request initiators and patched `IntersectionObserver.observe` / `createElement`): no `[data-chapter]` or `[data-reveal]` element observed, no canvas created, no script containing `WebGLRenderer` loaded, `.site-shell` absent after hydration, `data-variant="mobile"`; at 1440 × 900 the mirror image (14 chapters and 28 reveal blocks observed, three.js loaded, no `.m-landing`).
- **Hydration race** (`probe-race.js`, 4× and 6× CPU throttling): before the fix (commit `8cd38c1`) the DE phone showed two `.m-landing` roots for about 150 ms (the client-rendered tree next to the not yet removed server HTML, `2|Rr`); after it, one root throughout: `1|r` (server HTML) → `1|r` with the desktop tree gone → `1|R` (hydrated in place, `data-ready`).
- Mobile screenshots (scratchpad `landing-mobile/final2/mobile`, viewport and full page): 320 × 640, 375 × 812, 390 × 844, 430 × 932, 768 × 1024, 820 × 1180 (EN; DE at 320, 390, 768), and 1024 × 768 showing the desktop; `scrollWidth == clientWidth` at every one of them, no console errors, no canvas; the console's pending and final states at 390 (`console-390-before.png`, `console-390-after.png`).
- axe (WCAG 2.2 AA + best practice) clean at 390 px in EN and DE with the menu closed and open. The first run flagged the example run's pending rows (42 % opacity under 4.5:1); fixed by muting their names instead and hiding their decisions until the turn runs (`f31af4e`).

## Decisions taken for the owner

- **D-LM-1** The desktop starts at 1024 px; tablets below that (portrait, and landscape tablets narrower than 1024 px) get the new version; a 1024 px landscape tablet gets the desktop one.
- **D-LM-2** Both versions are server-rendered and switched by CSS; after hydration the hidden tree is unmounted and, thanks to its own Suspense boundary, never hydrated. The HTML carries both versions (about one extra landing page of HTML, no extra JavaScript for the desktop on phones).
- **D-LM-3** The mobile hero shows a static, lightly animated SVG district instead of the 3D scene: no WebGL and no three.js on phones, no pointer-driven camera on touch devices.
- **D-LM-4** Simplified interactions: no flow-reverse control, no report tilt, no online/PDF toggle (one report card), the risks as native details, the partner strip stands still (same dialog), the allocation roles as a list instead of tabs.
- **D-LM-5** The mobile version keeps every chapter and the chapter order of the desktop story and the same copy keys, so a copy change reaches both. New copy only under `landing.mobile`.
- **D-LM-6** The mobile example run reuses the desktop's data and playback hook by import only; markup and CSS are its own. Before the run it shows the empty value (`EMPTY_VALUE`) and no level, so a score that has not been produced is not shown as 0.
- **D-LM-7** Ids of the mobile tree are prefixed `m-`, so both trees can share one document before hydration; deep links to the desktop ids (`/#ai-score`) work on desktop and land at the top on a phone.
- **D-LM-8** Grids inside panels follow the panel's width (`@container`), not the viewport's; a browser without container queries keeps the one-column layout, which is always readable.

## Assumptions

- The dashboard route `/{lang}/dashboard/ai-score` and the docs page `/{lang}/docs/ai-plan-score` exist, as PLAN-LANDING-FIX-00 assumed.
- `useSyncExternalStore` and Suspense behave in React 19.3 as verified in the browser probe; if a future React hydrates dehydrated boundaries eagerly, the desktop tree would hydrate once before the switch removes it (its effects clean up on unmount; only the three.js chunk would then be fetched). The `LandingSwitch.test.tsx` hydration test pins the current behaviour.
- The owner accepts the duplicated HTML (both versions in the page source) as the price of a switch that never reads the viewport before the first paint and never shifts layout.

## Deviations from the plan

- The plan's step 2 named `MobileAiConsole` with "simpler markup": built with the same four rows, legend, score, scale and dimensions as the desktop, since nothing of it is hover-only; only the scale labels moved under the track.
- Container queries (D-LM-8) were not in the plan; the 768 px screenshots showed the viewport-based grids overflowing inside the split layout.

## Follow-ups

- A `/{lang}#ai-score` link shared from a desktop lands at the top of the page on a phone (D-LM-7); a small hash map in the switch could translate desktop ids to `m-` ids if that matters.
- The mobile header has no "scroll spy"; the menu is the only chapter navigation, which is enough for a page of this length.
