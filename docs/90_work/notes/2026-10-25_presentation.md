---
id: NOTE-2026-10-25-presentation
date: 2026-10-25
status: done
author: Claude (presentation), on the owner's request; decisions taken while the owner was away
covers: [PLAN-PRESENTATION-00, BM-SCOPE-02, BM-SCOPE-08, QCT-SCOPE-04, QCT-SCOPE-11, QCT-SCOPE-13, D-32, D-33, D-48, D-52, D-55, D-66, D-68, D-71, D-74, D-75]
---

# Presentation: ten slides at /{lang}/presentation

The owner asked for a presentation route, ten slides at most, extremely little text, premium animation, meaningful interactions, and a footer link. The owner was asleep, so every open point was decided here and is listed below instead of asked.

## What was built

| Part | Where |
|---|---|
| Route, static for EN and DE | `app/[lang]/(presentation)/presentation/page.tsx` |
| Own root layout: always dark, no site header, cookie notice kept, pre-paint boot script | `app/[lang]/(presentation)/layout.tsx`, `_components/deck-boot-script.tsx`, `lib/presentation/boot.ts` |
| Deck: top bar (mark home, counter, language, full screen), progress line, bottom bar (hint, dots or select, previous, next), keys, swipes, hash, live region, focus | `presentation/_components/` (`deck.tsx`, `deck-top-bar.tsx`, `deck-controls.tsx`, `use-deck-input.ts`, `use-slide-hash.ts`, `fullscreen-button.tsx`, `slide-heading.tsx`, `count-up.tsx`; styles in `styles/`, one file per section, imported in cascade order by `deck.tsx`) |
| Pure deck logic | `lib/presentation/slides.ts` (order, hash, keys, swipes) |
| Ten slides and their parts | `presentation/_components/slides/` (one file per part, a test next to each) |
| Data the slides show | `lib/presentation/`: `quick-check-demo.ts`, `run-demo.ts`, `fingerprint.ts`, `guard-demo.ts`, `qr.ts`, `facts.ts`, `blind-test/` |
| Copy | `dictionaries/{en,de}/presentation.json` (area `presentation`) |
| Footer links | `components/site-footer/` (docs layout), `app/[lang]/(website)/_components/sections/Closing.tsx` (landing); labels as new top-level keys at the end of `legal.json` and `landing.json` |
| Language switch keeps the slide | `components/language-switch/language-switch.tsx`: optional `hash` prop |
| e2e | `e2e/presentation.spec.ts` |

The slides: 1 why "First Move", 2 the challenge and the jury's questions, 3 Quick Check, 4 Business Plan, 5 AI Plan Score with a blind test, 6 the two addresses, 7 System 1 security, 8 self-healing apps, 9 next moves, 10 cost, collaboration, QR code and /1Slash. Table and interactions in [PLAN-PRESENTATION-00](../plans/2026-10-25_presentation-00_plan.md).

## Decisions

**Frame**

1. **Own route group and root layout.** `(presentation)` is a root layout of its own, so a visit from the landing or the docs is a full page load (Next.js 16: navigating between root layouts reloads). Always dark like the landing; the cookie notice stays, because the language switch sets the same functional cookie, and rests above the deck's bottom bar so it never covers the select or the arrows.
2. **Without JavaScript the slides are one long page.** The boot script sets `html[data-deck="js"]` before paint; every hidden or moving state is scoped to it. Controls that need the script (counter, bottom bar) are hidden without it. Print stacks the slides.
3. **The slide lives in the hash** (`#1`–`#10`), written with `history.replaceState`: deep links and reloads land on the slide, the browser back button leaves the deck instead of stepping through slides, and the language switch keeps the hash. For a deep link the boot script shows that slide before hydration, so slide 1 never flashes.
4. **Keys:** arrows, Space and Shift+Space, Page Up/Down, Home, End; keys a focused control needs (text fields, Space on buttons, arrow widgets) stay with it; Ctrl/Alt/Meta shortcuts stay with the browser. **Swipe** on touch and pen only; the stage keeps vertical scrolling.
5. **Index:** ten 44 px dots from 768 px; below, a native select (ten dots do not fit 44 px targets on a phone).
6. **Accessibility:** each slide is a labelled region with `aria-roledescription="slide"`; a polite live region announces "Slide n of 10: title"; the other slides are `inert`; when the index or a link between slides is used, focus moves to the new slide. The bottom bar is a `footer` landmark (axe flags content outside landmarks).
7. **Motion is CSS transitions plus one `requestAnimationFrame` count-up; no animation library.** Titles rise out of masks (with 0.2em of headroom, so the accents of Ä and Ü are not cut off), elements stagger in (`--i`), the progress line carries the mark's orange end node. **Reduced motion:** everything jumps to its end state, loops stop, and slides switch without a visibility transition (found by e2e: the global reduced-motion rule turned the 0 s visibility switch into 0.01 ms, and a slide hidden for that instant could not take focus).
8. **Tokens only** (`app/globals.css`): 0 radius, cyan for Quick Check and the primary action, orange for Business Plan and risk, no new hue. Archivo condensed uppercase plus the light italic accent (D-66), IBM Plex Mono labels, 44 px targets.

**Content**

9. **Slide 2 maps the jury's questions to slides** (BM-SCOPE-08 and QCT-SCOPE-11, condensed into six): methodology and clear results → 3, problem–solution fit and incentives → 4, risks and validation → 5, innovation and scale → 6 (and 7–9). Audiences from QCT-SCOPE-13.
10. **Slide 3 runs the real engine**, not a mock-up: the example "School, kindergarten and flats" (labelled "Illustrative inputs only"; its name comes from `presentation.json`, because the examples are named in English only), its figures formatted per language and the level names taken from the Quick Check's own dictionary. "Run again" loads `lib/quick-check` in the browser and compares an FNV-1a fingerprint of the whole result with the server's.
11. **Slide 4's meter is illustrative**: it counts the steps opened on the slide, not a project; it is labelled so.
12. **Slide 5, the proof (blind test).**
    - On the slide: the table, the score, the must-have gates that failed, one AI suggestion and the reveal. No grid of engine counts and no branch chips (review: too much text). The stats line counts every gate the run checked, follow-up gates included ("16 gates: 3 pass · 7 fail · 6 unclear"). The link to the AI Plan Score page reads "Method and sources": on this branch that page is still the stub without links (see open questions).
    - Case: **Smart Block Geblergasse, Vienna 17**, a real anergy project in existing buildings. Input only from the **Klima- und Energiefonds report created 30 Oct 2017**, before construction; every number checked against the PDF. Street, owners, team, later sources and the outcome are left out; empty fields where the report is silent. A test (`geblergasse-2017.test.ts`) fails if the input names the project or mentions anything after 2017.
    - Run as a **Business Plan only** project through the real engine (`scorePlan`) and the Vercel AI Gateway, **twice** (the agreed maximum). Run 1 scored 56.3 (shown 55, Promising, capped) but the German report and suggestions failed (see open questions). Run 2, the recorded one: **54 → shown 55 ± 3, Promising, capped**; 27 judgements in 1.4 s; gates 3 pass, 7 fail, 6 unclear; must-have failed: system boundary, water or ground permit route, minimum connection rate, subsidy fallback. Both runs land on the same shown score and level.
    - **The slide replays the recorded run** (`result.json`); the presentation makes no AI call (D-48). The reveal shows three facts with their sources: construction started in 2018 (Wienbibliothek), contracting with monthly fees for tenants (futurezone 2021), the Vienna urban renewal award (socialhousing.wien). It says plainly that **one case demonstrates the engine, it does not validate it**.
    - The engine's top suggestion was "Decide between owner financing and contracting, and write down who owns the boreholes, the network and the heat pumps", and what happened was contracting: a fair illustration, stated without claiming more.
    - The link "The plan" points to the 2017 report itself, for anyone to check the input. It names the project (the report does) but not the outcome.
    - Caveat for the owner: the gate "Zone in the Vienna Heating Plan 2040" failed, but that plan did not exist in 2017; the engine judges a 2017 plan by today's criteria.
13. **Slide 6:** agent@ is marked **"Not live yet"** (intake and guard built, A06 done; the conversation, A07, is still to do). Both addresses are `mailto:` links named "Write to …". Change `slides.emails.agent.status` and `statusNote` when A07 ships.
14. **Slide 7 is scripted and offline**, labelled "Demo · scripted values, no network". The four sample emails carry fixed probabilities; the thresholds (block 0.9, strike 0.6, off topic 0.7) are a copy of `lib/mail-agent/guard` THRESHOLDS, and a test checks the copy and that the guard's own `judge()` gives each sample the verdict the slide shows. The presentation does not import the AI layer (PLAN-AGENT-00 § Folders).
15. **Slide 8 is labelled "Concept · not built".** Nothing in the app tracks or fixes errors automatically yet.
16. **Slide 9's four suggested features** follow from the challenge: map import (open data fills the Quick Check), owner tracker (letters of intent, connection rate), funding and permits (grants, water-law permits, deadlines), live digital twin (metered data). The owner's 3D building scan leads, with a CSS 3D wireframe turning under a scan plane.
17. **Slide 10:** "about €180 to build" and "about €5 a month to run, up to 1,000 active users", "Maintenance not included", as the owner gave them (no other source). "Open to projects and long-term collaborations." "Powered by /1Slash", "A human and AI service", linking `https://1sla.sh/`.
18. **QR code:** `qrcode-generator` (MIT), error correction M, the full four-module quiet zone, drawn as SVG on the server. Square modules, finder patterns coloured like the mark: ink (top left), orange (top right), cyan (bottom left), all on the light panel tokens so each is at least 4.5:1 on Paper. `qr.test.ts` decodes the exact colours with `jsqr`; the e2e decodes the rendered code in the browser: both give exactly `https://kiarash.online/link`. The scan line passes twice when the slide opens, then rests, so it never sits over the code while a phone scans it.
19. **External links** (`1sla.sh`, the owner's page, the sources) open in a new tab with `rel="noopener noreferrer"`. Checked on 2026-10-25: `https://1sla.sh/` answers 200 ("1slash · One slash starts it. Humans keep it alive."); `https://kiarash.online/link` answers 200 ("Links — Kiarash", checked again 2026-10-25 after a first check had returned 404).
20. **Footer link in both footers**: the site footer (docs and legal pages) and the landing footer's legal row, which stays visible at every width (the landing hides its product links at 1100 px and below). `LegalLinks` now takes several extra links; a path inside the app stays a Next.js link. Labels: `legal.json` → `presentation`, `landing.json` → `presentation.footer` (new top-level keys at the end, as the shared-file rule asks).
21. **German copy** is complete, not partial, and waits for the owner's review like the rest (D-32). Terms: "Pitch-Vollständigkeit" (D-74), "Ihr nächster Zug". The AI suggestion on slide 5 is the engine's own German output and addresses the reader as "ihr" (plural informal), unlike the UI's "Sie".
22. **No model identifier in the slides.** `result.json` records which models the run used, as data for reproducibility, like the app's own model list.

## Dependencies added

- `qrcode-generator` 2.0.4 (dependency, MIT), listed in `lib/legal/third-party.ts`.
- `jsqr` 1.4.0 (devDependency, Apache-2.0), tests only.

## Deviations

- The engine's German report and suggestions were cut off in run 1. The engine files belong to another phase, so they were not changed; run 2 raised the text model's output limit to 8,000 tokens through `wrapLanguageModel` middleware inside the live test only.
- `lib/storage/no-html-rendering.test.ts`: the boot script joins the allow-list of build-time pre-paint scripts (same pattern as the theme and sidebar scripts).
- `lib/presentation/slides.ts`: the `count` parameters are typed `number` (they inferred the literal `10`).

## Follow-up: landing polish and AI Plan Score follow-ups merged (2026-10-25)

Both follow-up branches were merged into `dev` after this phase ([landing polish](2026-10-25_landing-polish-00.md), [AI Plan Score follow-ups](2026-10-25_ai-score-followups.md)). What changed for the deck:

- **Slide 5 links every source.** The label says "Every source, linked" again (DE "Jede Quelle, verlinkt") and opens the Sources section of the AI Plan Score page (`/{lang}/docs/ai-plan-score#sources`, DE `#quellen`); unit and e2e tests follow the anchor.
- **The engine no longer needs the live test's workaround.** The report and suggestion calls allow 6,000 and 8,000 output tokens, and German texts say "Sie". The live test dropped its `wrapLanguageModel` middleware (the first deviation above no longer applies to a new recording). The label now follows the shown score (D-81, method 1.1.0).
- **The recording stays as it is.** `result.json` is still the method 1.0.0 run: 54 shows 55 and is Promising under both label rules, so `summary.test.ts` accepts the same major version when the recorded label matches the current rule. Its German suggestion still says "ihr" (decision 21) until the run is recorded again.
  - *Update, same day (go-live, f6237c0):* the run was re-recorded with method 1.1.0 after all — 56.2, shown as 55 ± 3, German in "Sie" — so this bullet describes the morning's state, not the shipped one.
- **The landing replays the same run.** The landing's AI Plan Score chapter (desktop and mobile) now plays `result.json` and links "See the blind test" to `/{lang}/presentation#5` (`BLIND_TEST_SLIDE` in `AiScoreConsole.tsx`): if slide 5 moves, that constant moves with it.
- **Footers.** The site footer (docs and legal pages) shows "Docs" before "Presentation"; the landing keeps the presentation link in its legal row on the desktop and in the phone and tablet footer (`f237f47`).
- **Checks on the merged `dev`:** lint, typecheck, unit tests, build and the whole e2e suite (181 of 181, `presentation.spec.ts` included, after two timing fixes in other specs), as listed in the [landing polish note](2026-10-25_landing-polish-00.md#integration-on-dev-2026-10-25).

## Open questions for the owner

Collected on 2026-10-25 from the three builds of the overnight workflow (this presentation, the [landing fix](2026-10-25_landing-fix-00.md) and the [mobile landing](2026-10-25_landing-mobile-00.md)), minus what the review fixes, the landing polish and the AI Plan Score follow-ups have fixed (listed after the questions).

1. **Cost figures.** "About €180 to build" and "about €5 a month for up to 1,000 active users" come from the owner alone. Confirm what they include before slide 10 is shown publicly.
2. **German copy (D-32).** The German deck and landing copy wait for the owner's review, including the two new keys of the mobile landing (`landing.mobile.hero.visualLabel` "Niedertemperatur-Quartiersnetz", `landing.mobile.hero.visualAlt`).
3. **Record the blind test again** with a Gateway key (`PRESENTATION_LIVE_BLIND=1`, see `lib/assistant/plan-score/blind-test.live.test.ts`), so slide 5 and the landing replay method 1.1.0 with the engine's own output caps and a German suggestion in "Sie". A new recording changes the numbers on both without any copy change.
4. **Slide 6, agent@.** When the email conversation (A07, O8) ships, update `slides.emails.agent.status` and `statusNote` in `dictionaries/{en,de}/presentation.json` (they say "Not live yet").
5. **Where the desktop starts.** The desktop landing starts at 1024 px (D-LM-1). Should it start at 1200 px, so 1024–1199 px laptops and 1024 px landscape tablets get the touch version? The e2e specs assert the desktop header (six entries on one line) and the footer's product row at 1024 px and would change with it.
6. **Deep links on phones.** A link with a desktop id (`/de#ai-score`, shared from a desktop) lands at the top on a phone, because the mobile ids are prefixed `m-` (D-LM-7). Translate desktop ids to `m-` ids with a small hash map in the switch?
7. **Both landings in the HTML.** The page source carries both versions (about one extra landing of HTML, no extra JavaScript on phones, D-LM-2). Acceptable, or serve one version per device later (needs client hints or a cookie, and the page would lose static prerendering)?
8. **A shorter phone page.** The 390 px page is about 17 screens. Merging Scalability into Implementation and folding the canvas allocation roles and the Quick Check report card into `<details>` would bring it to about 10–12, but changes the chapters D-LM-5 keeps. Owner's call.

More owner questions stay in their own notes: the [AI Plan Score follow-ups](2026-10-25_ai-score-followups.md#open-questions-for-the-owner) (confirm D-81 and the 1.1.0 step, the scale mark near a threshold, relabelling saved 1.0.0 scores, the trailing space in `fit`) and the [landing polish](2026-10-25_landing-polish-00.md#decisions-taken-for-the-owner) (D-LP-1: the tokens doc's "Editorial accent" row is no longer used on the landing).

Closed since the builds:

- `https://kiarash.online/link` answers 200 ("Links — Kiarash"); the QR code decodes to it (review fix, decision 19).
- The engine's output caps for German (this note's former question 1): 6,000 and 8,000 tokens, German in "Sie" ([follow-ups](2026-10-25_ai-score-followups.md), items 1 and 2).
- The landing footer overlap (former question 3): merged; the presentation link sits in the landing's legal row (desktop), in the phone and tablet footer and in the site footer.
- Slide 5's link label (former question 5): "Every source, linked", opening the Sources section ([follow-ups](2026-10-25_ai-score-followups.md), item 5).
- The landing's illustrative example run (60 ± 6): replaced by the recorded blind test (D-LP-5); `aiScoreExample.ts` is gone.
- "Two tools. One system." while the overview lists three parts: "Three parts. One system." and "Screen. Plan. Score. / One workflow." (D-LP-4).
- The footer's "Quick Check" and "Business Models" both leading to `/dashboard`: they lead to the docs pages of the two modules (D-LP-3).
- The landing's plain links to `/{lang}/dashboard/ai-score` and `/{lang}/docs/ai-plan-score`: both routes exist and the landing e2e checks both links on desktop and mobile; nothing for the owner to decide.

## Verification

`pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass. `E2E_PORT=3347 pnpm test:e2e e2e/presentation.spec.ts`: 13 passed (keys, deep link and reload, language switch keeps the slide, criteria jump, blind test reveal, QR decode, both footers in EN and DE, phone width with the select and no sideways scroll, axe on every slide at 1440 and 390 px, axe after the interactions in German). `legal`, `responsive` and `foundation` e2e still pass (55). Screenshots of every slide and its interaction states at 1440 × 900 and 390 × 844, and a 320 px overflow check in EN and DE.

**Review fixes (2026-10-25).** Title masks with headroom for accents (e2e on `/de/presentation#9`); the stage clips instead of hiding; the landing's presentation link in its legal row (e2e at 390 and 1024 px); the cookie notice above the deck bar; slide 5 without the count grid and the branch chips (76 words before the run, 126 after, was 89 and 150), with every checked gate counted and the score level on one line; slide 3's example name in German; the stylesheet split into `styles/`, one file per section, imported in order by `deck.tsx` (every slide's screenshot unchanged). `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`; `e2e/presentation.spec.ts` 16 passed; `legal`, `responsive`, `foundation` 55 passed.
