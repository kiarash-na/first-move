---
id: PLAN-DASH-01
date: 2026-10-24
status: todo
challenge: [quick-check-tool, business-models]
covers: [DESIGN-TOKENS, QCT-SCOPE-09, OQ-24]
blocked_by: []
---

# Phase 01 · Foundation

## Goal

Routes, i18n, theming, shadcn, MDX and test tooling are in place. The landing page is moved but looks unchanged.

## Requirements covered

DESIGN-TOKENS §1–5 and §7; D-14, D-15, D-16, D-19, D-21, D-22, D-25.

## Steps

1. Read these docs in `node_modules/next/dist/docs/01-app/` first:
   - `02-guides/internationalization.md`
   - `03-api-reference/04-functions/next-root-params.md`
   - `03-api-reference/03-file-conventions/{proxy,layout,route-groups}.md`
   - `02-guides/{mdx,preventing-flash-before-hydration,content-security-policy}.md`
   - `03-api-reference/05-config/01-next-config-js/cacheComponents.md`
   - `02-guides/testing/{vitest,playwright}.md`
2. Move `app/layout.tsx` and `app/page.tsx` to `app/[lang]/(website)/`, and `components/landing/**` to `app/[lang]/(website)/_components/` (D-34), with no visual change. Add the `(dashboard)` and `(docs)` root layouts. Every root layout sets `<html lang>` and returns `en` and `de` from `generateStaticParams`. Add `app/global-not-found.tsx` (`experimental.globalNotFound: true`; dark; imports `globals.css`).
3. `proxy.ts`: redirect unprefixed paths. The matcher skips `_next`, files with an extension, and every path starting with `/en` or `/de`. Store the choice in `NEXT_LOCALE`.
4. `lib/i18n/`:
   - locale config and guard
   - server-only `getDictionary(lang, area)`: DE is deep-merged over EN, so missing DE keys fall back to EN (D-32). A test checks that DE has no keys EN lacks.
   - `format.ts`: Intl numbers, EUR, %, kWh/MWh/GWh auto-scaling, locale-aware number parsing
   - `LanguageSwitch` component: same path, other locale; it also sets the `NEXT_LOCALE` cookie (path `/`, 1 year)
5. Tokens:
   - Map the existing `app/globals.css` variables to shadcn names via `@theme inline`.
   - Add a light palette under `[data-theme="light"]`, derived from the DESIGN-TOKENS light/report values: Ink text on Paper, cyan role → *Accent on light*, orange darkened until 4.5:1 contrast.
   - Radius 0; focus ring 2px cyan, offset 4px; breakpoints 767/899/1100/1199.
   - Theme: every root layout renders `data-theme="dark"`. In `(dashboard)` and `(docs)` only, a pre-paint inline script applies the stored choice (localStorage), and a toggle changes it. `(website)` is always dark. Never read `cookies()`.
6. `shadcn init`, then add: button, card, input, label, select, tabs, tooltip, dialog, alert-dialog, dropdown-menu, sheet, sonner, chart, switch, slider, toggle-group, table, progress, badge, separator, skeleton, scroll-area. Restyle the variants to DESIGN-TOKENS §5. Make shadcn's `dark:` follow the attribute: `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));`.
7. `@next/mdx` with `mdx-components.tsx` at the root. `(docs)/docs/[[...slug]]/page.tsx` shows a "coming soon" page. Create `content/docs/{en,de}/.gitkeep`. Pass plugins as strings.
10. Install the whole stack from PLAN-DASH-00 now (Zod, Zustand, `idb`, Recharts via shadcn chart, Vitest + Testing Library + jsdom + `fake-indexeddb`, Playwright 1.63.0 exact, `@next/mdx`, `katex` and `yaml` as devDependencies for `gen:reference`), so later phases that run in parallel rarely touch the lockfile.
8. Headers in `next.config.ts`: CSP *without nonces* (keeps shells static, see the CSP guide "Without Nonces"), `connect-src 'self'`, `frame-ancestors 'none'`, a referrer policy.
9. Add `package.json` scripts `typecheck` (`next typegen && tsc --noEmit`), `test` (`vitest run`; jsdom + Testing Library; excludes `e2e/**`) and `test:e2e` (Playwright, pinned per PLAN-DASH-00). Write tests for format/parse, the locale guard and the proxy redirect logic.

## Open questions this depends on

None.

## Verification

- `pnpm build` passes.
- `/` redirects to `/en`; `/de` renders the landing.
- `/en/dashboard` renders a placeholder in dark and in light.
