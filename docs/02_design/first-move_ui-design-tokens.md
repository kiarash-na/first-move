---
id: DESIGN-TOKENS
title: 'First Move: UI Design Tokens'
source: [landing/design.md (moved here 2026-10-24; renamed from "5GDHC OS" to "First Move")]
applies_to: [10_quick-check-tool, 20_business-models]
---

# First Move: UI Design Tokens

**First Move**: *Start your 5GDHC Journey now*

Use this sheet for dashboards, forms, results, reports, and other user-facing tools. It covers the implemented UI only; 3D and scroll-animation specifications are intentionally excluded.

## 1. Brand rules

- **Name and slogan:** product name **First Move**; slogan *Start your 5GDHC Journey now*.
- **Mark:** the "Knight's move" (D-68): on a 3 × 3 board, a pipe runs from a hollow cyan node up two squares and one across to a glowing orange node. One component, `components/brand/brand-mark.tsx`; the favicon `app/icon.svg` drops the board points.
- **Dark-first:** near-black blue-tinted surfaces; use light surfaces mainly for reports and methodology/content-focused pages.
- **Sharp and technical:** `1px` borders, `0` border-radius, no decorative card nesting.
- **Two signals only:** electric cyan for Quick Check/cooling; blaze orange for Business Models/heating/risk.
- **Typography carries the premium feel:** condensed Archivo, small IBM Plex Mono labels, Archivo italic only for editorial emphasis. Sans serif only (D-66).
- **Clarity before theatre:** visible labels, explicit output states, plain-language reasons, and “screening—not a full feasibility study” where relevant.

## 2. Color

Canonical values are **OKLCH**. Alpha is written after `/`.

| Token | Exact value | Use |
|---|---|---|
| Ink 950 | `oklch(0.135 0.014 230)` | Main page/background; text on light surfaces |
| Ink 900 | `oklch(0.18 0.018 220)` | Raised dark surface |
| Ink 800 | `oklch(0.25 0.025 215)` | Secondary dark surface/diagram fill |
| Paper 100 | `oklch(0.95 0.012 200)` | Primary text on dark; light page surface |
| Paper 300 | `oklch(0.78 0.025 215)` | Secondary text on dark |
| Paper 500 | `oklch(0.65 0.025 220)` | Muted text, metadata, inactive labels |
| Cyan 500 | `oklch(0.88 0.19 213)` | Quick Check, cooling, promising, primary CTA, focus |
| Orange 500 | `oklch(0.75 0.22 45)` | Business Models, heating, risk, not promising |
| Report surface | `oklch(0.94 0.012 200)` | PDF/report pages |
| Text secondary on light | `oklch(0.35 0.025 220)` | Body copy on light surfaces |
| Accent on light | `oklch(0.50 0.12 220)` | Icons/labels on light surfaces |
| Report accent | `oklch(0.55 0.14 215)` | Assessment and chart marks on reports |
| Control background | `oklch(0.18 0.018 220 / 0.74)` | Secondary buttons and compact controls |
| Panel background | `oklch(0.135 0.014 230 / 0.88)` | Consoles, canvases, result panels |
| Control border | `oklch(0.78 0.025 215 / 0.28)` | Interactive panel/button borders |
| Subtle line | `oklch(0.78 0.025 215 / 0.18)` | Dividers, table/grid lines |
| Panel shadow | `0 30px 90px oklch(0.05 0.01 230 / 0.40)` | Large interactive consoles only |

**State mapping:** Promising = cyan + check; Further analysis = Paper 100 + analysis icon; Not promising = orange + cross. Never communicate state through color alone.

## 3. Typography

| Role | Exact specification |
|---|---|
| Display/UI sans | `Archivo Variable`, sans-serif; use its width axis through `font-stretch` |
| Editorial accent | `Archivo Variable`, italic, weight `300`; stretch `88%`; letter-spacing `-0.045em`; no uppercase (D-66) |
| Technical labels | `IBM Plex Mono`, monospace; weight `400`; `12px`; uppercase; letter-spacing `0.04–0.075em`; line-height `1.5` |
| Brand name | Archivo `20px`; weight `750–760`; stretch `82%`; letter-spacing `-0.045em`; line-height `1` |
| Page/panel title | Archivo `25–35px`; weight `510–590`; stretch `82–88%`; letter-spacing `-0.035–-0.045em`; line-height `1.1–1.15` |
| Marketing display | Archivo `clamp(3.4rem, 6vw, 6rem)`; weight `590`; stretch `76%`; letter-spacing `-0.055em`; line-height `0.94`; uppercase |
| Body | Archivo `16–17px`; weight `400`; line-height `1.6–1.65`; preferred copy measure `58ch` |
| Small body/table text | Archivo `14px`; line-height `1.5–1.55` |
| Control label | IBM Plex Mono `12–13px`; weight `400–600`; uppercase |
| Parameter/value label | Archivo `17px`; weight `480`; value in IBM Plex Mono `12px` uppercase |

Use uppercase for technical labels and display headlines, sentence case for explanations and form content. Do not substitute Inter, Roboto, Arial, or a system-default font.

## 4. Layout and spacing

| Token | Exact value |
|---|---|
| Content maximum | `1600px` |
| Page gutter | `clamp(20px, 3.2vw, 52px)` |
| Main grid | `12` equal columns |
| Grid gap | `clamp(20px, 2.5vw, 42px)` |
| Panel padding | `clamp(22px, 3vw, 40px)`; use `20px` on small screens |
| Standard row padding | `16–24px` |
| Control-to-control gap | `8px`; larger content groups `24–32px` |
| Section/content gap | `48–60px` |
| Border | `1px`; selected underline/indicator `2px` |
| Radius | `0` on buttons, panels, inputs, menus, and reports |
| Desktop header padding | `20px` top / `16px` bottom |
| Mobile header padding | `14px` top / `12px` bottom |

Use thin dividers and spacing instead of nested cards. Keep interactive consoles visually separate from marketing content.

## 5. Controls

| Control | Exact values |
|---|---|
| Minimum touch target | `44 × 44px` |
| Large primary CTA | Height `60px` (`56px` mobile); padding `0 24px`; gap `42px`; mono `13px`, weight `600`; cyan background, Ink 950 text |
| Header primary CTA | Height `46px`; padding `0 18px`; gap `22px`; mono `12px`, weight `600` |
| Secondary control | Min-height `44px`; padding `0 14–15px`; gap `8–10px`; mono `12px`; control background/border |
| Mobile navigation row | Min-height `54–56px`; horizontal padding `18px` |
| Accordion row | Min-height `76px`; padding `16px 24px` (`16px` on mobile) |
| Range input | Height `44px`; track `2px`; thumb `15 × 15px`; square thumb; `1px` cyan border |
| Focus-visible | `2px` solid Cyan 500; offset `4px` |
| Icons | Line icons, no emoji; common sizes `16–22px`; feature icons `30–35px`; stroke `1.5–1.8` |

**Interaction states**

- Hover: `translateY(-2px)` when appropriate; `160–180ms`, `ease-out`.
- Active/press: `translateY(0) scale(0.98)`.
- Selected: matching cyan or orange text/border plus `aria-pressed` or equivalent state.
- UI transitions: `180–240ms`; signature easing `cubic-bezier(0.23, 1, 0.32, 1)`.
- Respect reduced-motion preferences and remove nonessential movement.

## 6. Data and results UI

- Use `2–3px` lines for compact indicators; `2px` for selected underlines and range tracks.
- Keep grid lines at the Subtle line value; do not brighten decorative grids.
- Quick Check panels use cyan emphasis; Business Model and Reality Check panels use orange emphasis.
- Put the overall assessment, decisive reasons, and screening boundary in the same result view.
- Label sample interfaces explicitly: **“Interactive preview,” “Example output,”** and **“Illustrative inputs only.”**

## 7. Responsive and accessibility

- Layout breakpoints used: `1199px`, `1100px`, `899px`, `767px` maximum-width queries.
- Collapse primary navigation at `899px`; use single-column/mobile layouts at `767px`.
- Verification widths: `375`, `768`, `1024`, and `1440px`.
- Body text: `16px` preferred; never below `14px`. Metadata/technical labels: minimum `12px`.
- Keep all touch targets at least `44 × 44px`; leave at least `8px` between adjacent actions.
- Every input needs a visible label; every toggle needs text/state feedback; every icon-only control needs an accessible name.
- Maintain contrast of at least `4.5:1` for body text and `3:1` for large text/UI boundaries.
- Preserve keyboard operation, visible focus, reduced motion, and no horizontal page scrolling.
