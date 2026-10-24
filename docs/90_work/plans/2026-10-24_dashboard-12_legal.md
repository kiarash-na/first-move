---
id: PLAN-DASH-12
date: 2026-10-24
status: done
challenge: [quick-check-tool, business-models]
covers: [DESIGN-TOKENS, D-39, D-40, D-41, D-42, D-43, D-44, D-45, D-46]
blocked_by: [PLAN-DASH-11]
---

# Phase 12 · Legal pages, licence and cookie notice

## Goal

Make the open-source claim true and give every visitor the legal information a public website needs: Terms of Use, Privacy Policy, Cookie Policy, Imprint, AI transparency (EU AI Act) and the licence page, in EN and DE, reachable from the footers, with a bottom-left cookie notice and a GitHub-readable `LICENSE`. **Legal documents only: no change to app behaviour (D-39).**

## Requirements covered

No requirement IDs (the requirement folders have no legal scope). Decisions D-39 to D-46 in [owner decisions](../notes/2026-10-24_owner-decisions.md); styling from DESIGN-TOKENS.

## Steps

1. `lib/legal/`: `operator.ts` (every legal fact), `interpolate.ts` (`{{token}}`, EN/DE), `inline.ts` and `parse-blocks.ts` (the text grammar), `docs.ts`, `ai.ts` (`AI_FEATURES_LIVE`), `notice.ts` (cookie notice state), `review.ts` (`DE_REVIEW_PENDING`), `third-party.ts`.
2. Dictionaries: new areas `legal`, `terms`, `privacy`, `cookies`, `imprint`, `ai`, `license` in `dictionaries/{en,de}/` and `lib/i18n/dictionaries.ts`.
3. Routes `app/[lang]/(docs)/{terms,privacy,cookies,imprint,ai,license}/page.tsx` with the shared `_components/legal/` (page shell, blocks, inline text, third-party table, AI providers).
4. `components/site-footer/` (footer and `LegalLinks`) and `components/cookie-notice/`.
5. Wire-up, additive only: docs layout (footer and notice), website and dashboard layouts (notice), landing footer (`Closing.tsx`, `story.css`, `landing.json`).
6. Repo metadata: `LICENSE` (GitHub's Apache-2.0 text), `NOTICE`, `package.json` (licence, author, repository, homepage, version 0.2.0), README sections.
7. Guard tests: placeholders and tokens, DE/EN structure parity, links and anchors, required facts per document, storage keys vs the Cookie Policy, dependencies vs the licence table, `LICENSE` unmodified.
8. e2e: axe on the six pages (EN/DE, both themes, 375 and 1440 px), the cookie notice on all three layouts, footer links, no horizontal overflow.

## Open questions this depends on

None in `OQ-xx`. Open items for the owner are in the [phase 12 note](../notes/2026-10-24_phase-12_legal.md) (pre-launch checklist).

## Verification

`pnpm lint && pnpm typecheck && pnpm test && pnpm build`, `pnpm test:e2e`, and a manual pass over the six pages in EN/DE, light and dark, phone and desktop. `diff <(gh api licenses/apache-2.0 --jq .body) LICENSE` is empty.
