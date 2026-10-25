---
id: PLAN-LANDING-POLISH-00
date: 2026-10-25
status: done
challenge: [quick-check-tool, business-models]
covers: [DESIGN-TOKENS, D-16, D-22, D-27, D-32, D-33, D-34, D-66, D-71, D-72, D-73]
blocked_by: [PLAN-LANDING-FIX-00, PLAN-LANDING-MOBILE-00, PLAN-PRESENTATION-00]
---

# Landing polish 00 · No italic, docs links, honest footer, a third part, the real blind test

## Goal

Six owner requests on the landing page after the desktop fix (PLAN-LANDING-FIX-00), the separate mobile version (PLAN-LANDING-MOBILE-00) and the presentation (PLAN-PRESENTATION-00) were merged; both landings, the shared header and footer of the docs and legal pages, in EN and DE.

Owner's words: "There is the italic text in homepage. I wanted to get rid of that as well, actually, and just use the same style for both the texts. Like the main title on top of usually what's italic is looking good. Use the same styling for the current italic ones as well." and "add link to public docs in header and footer."

| # | Request | Where |
|---|---|---|
| a | No italic on the landing: every emphasised word takes the style of the main title | `landing.css`, `story.css`, `mobile.css`, `rich-text.tsx`, the website layout's font imports |
| b | A "Docs" link (DE "Doku") to `/{lang}/docs` in the site header and footer: desktop landing, mobile landing (menu and footer), the docs and legal pages | `Header.tsx`, `MobileHeader.tsx`, `Closing.tsx`, `MobileFooter.tsx`, `components/site-footer/site-footer.tsx`, `(docs)/_components/app-header.tsx` |
| c | The presentation link in the mobile footer | `MobileFooter.tsx` (already merged; verified) |
| d | The footer's "Quick Check" and "Business Models" no longer both lead to `/dashboard` | `Closing.tsx`, `MobileFooter.tsx` |
| e | "Two tools" rewritten: the AI Plan Score is a third part | `landing.json` `hero.gatewayLabel`, `product.tools.kicker` |
| f | The AI Plan Score chapter shows the recorded blind test instead of an invented example run | `lib/presentation/blind-test/recorded-run.ts`, `AiScoreConsole.tsx`, `MobileAiConsole.tsx`, `page.tsx`, `landing.json` `aiScore.console` |

## Build

1. **Italic (a).** `.title-line--accent`, `.section-title em`, `.get-started-section h2 em`, `.m-title em` and `.m-hero__accent` lose their italic, light, wide, sentence-case overrides and keep only `font-style: normal`, so the emphasised words inherit the title around them (uppercase, condensed, 590–610). `RichText` keeps the `*x*` markup and the `<em>` (the copy still says which words carry the weight). The website layout drops the Archivo italic face, which nothing on the landing uses any more. An e2e check lists every visible element with text in italic on both landings and expects none, and that the three hero title lines share one computed style.
2. **Docs links (b).** Desktop header: a sixth entry "Docs" after "Methodology" (a `Link` to `/{lang}/docs`, not a chapter anchor); at 1024 px the six entries fit between the brand and the actions (EN nav 560 px, DE 545 px, the actions start where the nav ends), with 14 px of air added before the actions from 1199 px down. Mobile header: a "Docs" row after the five chapters in the menu, with an outward arrow because it leaves the page. Landing footers: "Docs" closes the product row. Shared `SiteFooter` (docs and legal pages): "Docs" before "Presentation" in the legal row. Docs header (`AppHeader`): a "Docs" link before the language switch. Copy: `landing.header.nav.docs`, `landing.closing.footer.docs`, `legal.documentation`, `common.docs.link` (EN "Docs", DE "Doku", the docs' own meta title).
3. **Footer row visible on the desktop (b).** `story.css` hid the footer's product links at 1100 px and below; the desktop tree shows from 1024 px only (PLAN-LANDING-MOBILE-00), where the four links fit next to the brand (805 px of 958 at 1024 px EN), so the rule went. The footer's product row now shows at every desktop width.
4. **Presentation link in the mobile footer (c).** Already in `MobileFooter.tsx` after the merge of PLAN-LANDING-MOBILE-00 and PLAN-PRESENTATION-00 (`t.presentation.footer` → `/{lang}/presentation`), tested in `MobileFooter.test.tsx` and `e2e/landing-mobile.spec.ts`, visible in the 390 px screenshot. Nothing to add; verified.
5. **Footer targets (d).** "Quick Check" → `/{lang}/docs/quick-check`, "Business Models" → `/{lang}/docs/business-plan` (`docHref` of `lib/docs/pages`), "Methodology" stays the chapter anchor, "Docs" → `/{lang}/docs`. See D-LP-3.
6. **A third part (e).** Hero gateway label "Screen. Plan. Score. / One workflow." (DE "Prüfen. Planen. Bewerten. / Ein Ablauf."), above the two entry buttons; overview kicker "Three parts. One system." (DE "Drei Teile. Ein System.") above the three rows 01, 02, AI.
7. **The recorded blind test (f).** `lib/presentation/blind-test/recorded-run.ts` shapes `result.json` (the run slide 5 replays) for the landing: the 27 judgement levels in the four turns (sizes 8, 8, 5, 6, mirrored from the engine and pinned by `lib/ai/plan-score/method.test.ts`, which also checks that the recording lists the judgements in the engine's order), one real decision per turn (`source-type` → the branch's choice, `boundary`, `deal-breaker`, `decision-gate` → the gates' outcomes, their turns pinned against the engine), the score as the app shows it (`score.shown`, `band`, `level`, `capped`) and the seven dimensions after their caps. The names come from the `ai-score` dictionary, loaded by the landing page on the server (`recordedRun(aiScore.labels)`) and passed to both trees. The consoles play it as before; new: the head says "Recorded run · Real Vienna plan · {year}", a "Must-have failed · {n} dimensions capped" line under the level, hatched bars for the capped dimensions, a note with the run's date and the plan's year, and "See the blind test" → `/{lang}/presentation#5`. The dates and the year are formatted from the recording (`formatDate`), never typed. `aiScoreExample.ts` and its invented decisions ("Groundwater", "Pass") are gone, with the `aiScore.console.decisions` copy.
8. **Tests.** `recorded-run.test.ts` (every number equals the recording; the decisions are the recorded ones; German names; refusals), the tripwire in `method.test.ts`, the console, story, header, footer, root and page tests follow; `e2e/landing.spec.ts` (six nav entries on one line and clear of the actions, the score and level read from `result.json`, the console's title and link, the footer row and its targets at the three widths in EN and DE, no italic), `e2e/landing-mobile.spec.ts` (the menu's docs row, the footer row, the recorded score, no italic), `e2e/docs.spec.ts` (the shared header and footer reach the docs index from a docs page and a legal page).
9. Screenshots before and after at 1440 × 900, 1280 × 800, 1024 × 768, 390 × 844, 768 × 1024, EN and DE; `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; the e2e specs named in the note; commits step by step.

## Decisions taken for the owner (to review)

- **D-LP-1** No italic anywhere on the landing: the emphasised words of the titles and the hero's third line take the style of the title around them. DESIGN-TOKENS §3's "Editorial accent" row (Archivo italic 300) is no longer used on the landing; the presentation deck still uses it. The `*x*` markup in `landing.json` stays, so the owner can bring a distinction back with one CSS rule.
- **D-LP-2** "Docs" sits in the landing's header nav as a sixth entry after the chapters and in the footer's product row; on the docs and legal pages it joins the legal row before "Presentation" and the header before the language switch. DE "Doku" (the docs' own `metaTitle`), not "Dokumentation", so the header stays on one line at 1024 px.
- **D-LP-3** The footer's "Quick Check" and "Business Models" lead to the docs pages of the two modules, not to the dashboard or back up the page: a visitor at the end of the page wants to read what each module does and how it calculates; the docs pages explain it and link to the app. "Get Started" remains the way into the dashboard.
- **D-LP-4** The AI Plan Score is a "part", not a third "tool": "Screen. Plan. Score. One workflow." above the two entries, "Three parts. One system." above the three rows. The gateway keeps two buttons (the score is reached through the Business Plan and its own chapter).
- **D-LP-5** The landing shows the recorded blind test (55 ± 3, Promising, a must-have failed) and names the real decisions, labelled as a recorded run on a real 2017 Vienna plan, with the slide's caveat ("one case shows how the engine works; it does not validate it") and a link to slide 5. The decision shown per turn is the engine's branch or gate of that turn with the clearest story: the source branch, the failed boundary gate (the reason for the cap), the unclear deal-breaker gate, the unclear decision gate.
- **D-LP-6** The footer's product row stays visible at 1024–1100 px on the desktop (the rule that hid it predates the mobile landing).

## Verification

Done 2026-10-25: see [the note](../notes/2026-10-25_landing-polish-00.md) for the screenshots, the checks and the measurements.
