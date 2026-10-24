---
id: NOTE-2026-10-24-agents-04-public-docs
date: 2026-10-24
author: Claude (phase A04; review and close in the cloud session)
status: done
relates_to: [PLAN-AGENT-04, PLAN-AGENT-00, D-19, D-22, D-32, D-34, D-57, D-61]
---

# Agents 04 · Public docs and knowledge index

The first public docs are live under `/[lang]/docs`: seven English pages, a page list and a pager. German routes show the English page with a German note. The two AI pages (`assistant`, `email-agent`) and every `<AiOnly>` passage stay hidden while `AI_FEATURES_LIVE` is false; the AI pages then answer 404. The knowledge index (`pnpm gen:knowledge`) holds the docs for both agents (D-57).

The pages were built in `d857092` by a worker that was stopped before its note and its review. This session ran one independent, read-only review against the plan, fixed what it found, and wrote this note.

## What was built

| Part | Where |
|---|---|
| Seven pages: `index`, `what-is-5gdhc`, `quick-check`, `business-plan`, `assistant`, `email-agent`, `data-and-privacy` | `content/docs/en/*.mdx` |
| Page list in reading order, which pages are AI pages, `visibleDocs`, `docFromParam`, `docHref`, `docNeighbours` | `lib/docs/pages.ts` |
| Route: prerenders the visible pages, `ensureStatic = "navigation"` so a hidden or unknown slug answers 404, metadata from `docs.json` | `app/[lang]/(docs)/docs/[[...slug]]/page.tsx` |
| Article with the DE note and `lang="en"` on the content, page list, pager | `_components/docs-article.tsx`, `docs-nav.tsx`, `docs-nav-link.tsx`, `docs-pager.tsx` |
| Loading a page's MDX with the EN fallback | `_components/doc-content.ts` |
| MDX components (headings with anchors, links checked against the visible pages, lists, notes) and `<AiOnly>` | `_components/mdx/` |
| Copy: page titles and descriptions, nav, pager, the English-only note | `dictionaries/{en,de}/docs.json` |
| Knowledge index with the docs (89 EN chunks from the docs; DE falls back per source) | `lib/ai/knowledge/generated/` |
| Content tests: one H1 equal to the page title, no level-3 headings, every link and anchor resolves, a content guard (no `docs/9…`, no env names, no secret-looking strings, no internal paths), the Quick Check numbers tied to the engine | `content/docs/content.test.ts` |
| Search finds the right page for ten fixed questions | `lib/ai/knowledge/search.test.ts` |

## Review, 2026-10-24

One reviewer read `d857092` against PLAN-AGENT-04 (read-only, no build, no e2e). Its findings and what happened to them:

| # | Finding | Outcome |
|---|---|---|
| B1 | No e2e for the docs: nothing checked the 404 of the AI pages at runtime, axe ran on `/de/docs` in dark only, `foundation.spec.ts` still said "coming soon" | **Fixed:** `e2e/docs.spec.ts` (every visible page 200 in EN and DE with its title, the page list and no link to a hidden page; the AI pages 404 in both languages; the German note and `lang="en"`; axe on `/en/docs` and `/de/docs/quick-check` in dark and light). The foundation test now checks the introduction's title. |
| B2 | No phase note, status still in progress, the A08 go-live item missing | **Fixed:** this note; plan and CONTEXT `done`; A08 step 8. |
| S1 | `data-and-privacy` described the AI layers in the present tense outside `<AiOnly>`, against the AI page ("contains no AI system") and the Privacy Policy ("plans") | **Fixed:** the whole section "The AI features and your data" is inside `<AiOnly>`. The page's meta description no longer names the AI features (A08 may put it back). |
| S2 | "Every slug renders" is not tested with the real MDX: Vitest has no MDX transform, so the unit tests mock the content | **Not built.** It would need `@mdx-js/mdx` as a direct dev dependency. The e2e spec now renders every visible page from the production build, and it takes the AI pages in by itself once the flag flips (A08), so the gap is the AI pages before go-live only. |
| S3 | The knowledge index keeps the AI pages and the `<AiOnly>` text, so an email answer could cite a page that answers 404 | **Recorded:** A08 step 8 says `AI_FEATURES_LIVE` goes on before or with `EMAIL_AGENT_ENABLED`. Harmless until then: nothing outside tests searches the index. |
| S4 | "No server database" (`index`, `data-and-privacy`) becomes false once the email agent stores records | **Fixed:** both now speak of the projects in the browser only (D-48(b)). |
| S5 | German readers got the "English only" note in English | **Fixed:** `dictionaries/de/docs.json` `page.englishOnly`, with a unit test; the DE review note is regenerated. |
| N1 | The Promising rule left out "at least one relevant demand" (`no_relevant_demand` in `overall-rule.ts`) | **Fixed** in `quick-check.mdx`. |
| N2 | `rejects.toThrow()` passes on any error | **Fixed:** the 404 tests match the `notFound()` digest. |
| N3 | `content/docs/en/.gitkeep` still there | **No change:** `d857092` already deleted it; only `de/.gitkeep` remains, for the empty folder. |
| N4 | Only the licence page and the 404 link to `/docs`; the header, landing and dashboard do not | **Follow-up**, outside plan step 3. |
| N5 | `lib/ai/knowledge/load.ts` strips `-\d+$` from ids, so a future heading that ends in a number could clash with chunk suffixes | **Follow-up**, latent today. |

**Found while closing:** the email-agent page said a waiting first message "is kept, encrypted" and "deleted after 7 days". A06 keeps only the Resend ids of a waiting email, sealed, for 7 days; the email itself stays with Resend for its 30 days. The page now says the message waits unread and is never processed without confirmation within 7 days, and "the list of waiting messages" is what is encrypted. D-54 says unconfirmed emails "are deleted after 7 days": **owner decision for A07/A08**: either delete the Resend thread after 7 days without consent, or let D-54 and the Privacy Policy say 30 days at the email provider.

## Plan steps

| Step | State |
|---|---|
| 1 Read | done |
| 2 Pages | done, seven pages; claims checked by the reviewer against the requirement folders, the engine and the plans |
| 3 Navigation | done: page list and pager, copy in `docs.json` (D-34) |
| 4 German | done: the EN page with a German note, content marked `lang="en"` (D-32) |
| 5 Knowledge index | done; `gen:knowledge --check` runs in `pnpm test` |
| 6 Tests | done, apart from S2 above |

## Claims that rest on a decision or a plan, not on a requirement file

The owner reviews these first. The Quick Check page cites its equations, tables and OQ answers by ID; everything below has no requirement file behind it.

- **Index and Data and privacy:** browser storage, the mirror, persistent storage, 20 earlier versions and restore (D-11); Link to a file (D-12); export and import of `.firstmove.json` with results recomputed (D-13); no account, no backend (D-14); one functional cookie and no tracking (D-39, Cookie Policy); the export reminder and tab sync (PLAN-DASH-04).
- **Quick Check:** applying TBL-4/5 capacities per source for the whole project, and the 30,000 to 68,000 kWh/a per building example (D-36, OQ-26); Play with parameters (D-10); the area in m² with hectares shown and the empty share grid (D-31).
- **Business Plan:** a qualitative workspace that shows the Quick Check figures read-only (D-27); free navigation (D-28); one model per project, compared by duplicating (D-29); the pitch-readiness checklist, unofficial (D-30, D-37); six examples, four from BM-SCN-01..04 (D-04).
- **AI assistant** (hidden until A08; rests on PLAN-AGENT-05, not built yet): providers and the Auto Router (D-49); the model chips, their kinds and the defaults; the 6-digit PIN, five wrong PINs, the 30-minute lock (D-50); the file types and limits (5 files, 10 MB each, 20 MB in total, 60 PDF pages; built in A03, `lib/ai/documents/limits.ts`, and shared with email); the review card; the AI chips and provenance (PLAN-AGENT-00 schema v2); chat history of at most 200 messages; the spending-limit confirmation.
- **Email agent** (hidden until A08; rests on PLAN-AGENT-06, built, and PLAN-AGENT-07, not built yet): DMARC and the confirm step (D-54); the rules: warning, 30-day pause, block (D-55); retention (D-56); the processors (D-48(b), D-52, D-64); tracking (D-63); the numbered questions, the attachment limits, the results email and the project file (PLAN-AGENT-07, D-58); "for now in English".

A08 re-reads both AI pages against the built A05 and A07 before the flip (A08 step 8).

## Checks

`pnpm lint`, `pnpm typecheck`, `pnpm test` (with `gen:knowledge --check` and the DE review check), `pnpm build` and `pnpm test:e2e` pass on `dev`.
