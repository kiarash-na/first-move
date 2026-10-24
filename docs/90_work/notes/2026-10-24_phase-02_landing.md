---
id: NOTE-2026-10-24-phase-02-landing
date: 2026-10-24
author: Claude (phase 02 sub-agent)
relates_to: [PLAN-DASH-02, DESIGN-TOKENS, D-19, D-20, D-32, D-34]
---

# Phase 02 · Landing in EN/DE as First Move

Executed [PLAN-DASH-02](../plans/2026-10-24_dashboard-02_landing-i18n.md). `pnpm lint && pnpm typecheck && pnpm test && pnpm build` pass (55 test files, 155 tests).

## Built

- **All landing copy is in `dictionaries/en/landing.json`** (keys: `meta`, `header`, `hero`, `product`, `quickCheck`, `businessModels`, `closing`). Aria-labels, SVG labels, the diagram captions and the metadata are included.
- **Server to client.** `app/[lang]/(website)/page.tsx` is now a server component: `requireLocale`, then `getDictionary(lang, "landing")` and `"common"`, then `<Home t lang language />`. `Home` and the sections stay client components and receive only the strings as props (`t`), no JSON import in client code. Type: `Landing` / `LandingCopyProps` in `_components/types.ts`.
- **Metadata** is `generateMetadata` in `(website)/layout.tsx` (title "First Move: Start your 5GDHC Journey now").
- **Rename.** Header and footer brand show "First Move" (descriptor "5GDHC screening", footer tag "5GDHC"). The hero headline is the slogan in the same three-line layout (the last line stays serif). "Operating system" no longer appears; "5GDHC" is kept where it names the technology.
- **CTAs.** Header CTA, closing "Get Started" and the footer "Quick Check" / "Business Models" are `next/link` to `/[lang]/dashboard` (`withLocale`). In-page anchors (nav, tool cards, "Explore Business Models", "Check the methodology", back to top) are unchanged.
- **Language switch** (`components/language-switch`) in the header: in the actions row on desktop (`max-md:hidden`), and as the last row of the mobile menu (`.mobile-nav__language` in `story.css`).
- **`RichText`** (`_components/rich-text.tsx`): dictionary strings use `\n` for a line break and `*x*` for the serif emphasis, so headlines keep their markup without HTML in JSON.
- **German (D-32).** `dictionaries/de/landing.json` has only the metadata, nav, the "Get Started" labels, the footer links and "back to top". Everything else falls back to EN through `getDictionary`. The existing all-areas test (`lib/i18n/dictionaries.test.ts`) already checks "DE has no keys EN lacks", so no new helper was needed.
- Tests: `rich-text.test.tsx`, `Header.test.tsx` (CTA href, language switch in both navs).

## Verified

- `/en` and `/de` at 375, 768, 920, 1440 px: no horizontal overflow (`scrollWidth == innerWidth`); mobile menu with the switch checked in a screenshot; the 3D scene is untouched.
- The header CTA opens `/en/dashboard`; the switch on `/en` goes to `/de` (title in German).

## Deviations

1. **Brand descriptor** "Operating System" became "5GDHC screening" (the plan gives no text; "5GDHC screening" is how CLAUDE.md describes the product). The slogan is the hero headline instead.
2. **Header CSS added** in `story.css`: the descriptor is hidden up to 1100 px and the brand name and CTA text never wrap, because the language switch made the header too tight between 900 and 1100 px.
3. Hero line 2 "5GDHC" (all caps via the existing style) replaces "system for"; the full slogan is the `aria-label` of the `h1`.
4. Dashes in a few sentences ("—") were replaced by commas or colons while moving the copy.

## Follow-ups

- Phase 11: translate the rest of `landing.json` into DE (`missingKeys(en, de)` lists it; arrays such as `product.audiences` and `closing.methodology.rows` must be given whole).
- The footer "Quick Check" / "Business Models" links both go to the dashboard start; later phases may deep-link to the module routes.
- The landing preview text ("Illustrative inputs only") is not the Quick Check math; it stays a marketing preview.

## What later phases must know

- Use `Dictionary<"landing">` types only on the server or as props; never import `dictionaries/**` JSON in client code (tests may).
- For any multi-line headline in a dictionary, reuse `RichText` (it lives in the website `_components/`; move it to `components/` if the dashboard needs it, D-34).
- `LanguageSwitch` needs `common.language` (`label`, `names`, `short`), passed as props.
