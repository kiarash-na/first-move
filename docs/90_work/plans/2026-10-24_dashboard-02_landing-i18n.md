---
id: PLAN-DASH-02
date: 2026-10-24
status: done
challenge: [quick-check-tool, business-models]
covers: [DESIGN-TOKENS]
blocked_by: [PLAN-DASH-01]
---

# Phase 02 · Landing in EN/DE as First Move

## Goal

The landing page reads all copy from dictionaries (DE may fall back to EN, D-32), is renamed to First Move and links into the dashboard. Its look and 3D scene stay the same.

## Requirements covered

DESIGN-TOKENS §1 (name, slogan); D-19, D-20.

## Steps

1. Move every visible string in `app/[lang]/(website)/_components/**` (including aria-labels and metadata) into `dictionaries/{en,de}/landing.json`. Pass the strings in from the server page as props, so no dictionary ships to the client bundle.
2. Rename "5GDHC OS" / "Operating System" to **First Move**, with the slogan *Start your 5GDHC Journey now*. Use the localized `generateMetadata`. Keep "5GDHC" wherever it names the technology.
3. Point the header CTA, "Get Started" and the footer "Quick Check" / "Business Models" links to `/[lang]/dashboard`. Keep in-page anchors where they scroll within the page.
4. Add the language switch to the header (desktop and mobile menu).
5. German: basis only (D-32). Create `dictionaries/de/landing.json` with at most the nav, CTAs and metadata translated; everything else falls back to EN. Full DE copy comes after the owner's review.
6. Add a test that DE has no keys EN lacks (one shared helper for all areas).

## Open questions this depends on

None.

## Verification

- `/en` and `/de` render with no layout overflow at 375/768/1440.
- The CTA opens `/[lang]/dashboard`.
