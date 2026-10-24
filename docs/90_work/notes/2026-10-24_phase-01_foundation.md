---
id: NOTE-2026-10-24-phase-01-foundation
date: 2026-10-24
author: Claude (phase 01 sub-agent)
relates_to: [PLAN-DASH-01, PLAN-DASH-00, DESIGN-TOKENS, D-14, D-15, D-16, D-19, D-21, D-22, D-25, D-32, D-34, D-35]
---

# Phase 01 · Foundation

Executed [PLAN-DASH-01](../plans/2026-10-24_dashboard-01_foundation.md). `pnpm lint && pnpm typecheck && pnpm test && pnpm build` pass (53 test files, 152 tests). `pnpm test:e2e` passes (8 tests).

## Built

**Routes** (PLAN-DASH-00, D-34)

- `app/[lang]/(website)/` – landing moved here unchanged: `layout.tsx` (root, always `data-theme="dark"`), `page.tsx`, `_components/` (was `components/landing/`). Verified at 1440 and 375 px against screenshots of the old build: same page height, only pixels inside the animated 3D scene differ.
- `app/[lang]/(dashboard)/layout.tsx` – root layout with the pre-paint theme script; `dashboard/page.tsx` shows a placeholder (`dashboard/_start/start-placeholder.tsx`, replaced in phase 07).
- `app/[lang]/(docs)/layout.tsx` – root layout with theme script and header; `docs/[[...slug]]/page.tsx` shows "coming soon" for the index and calls `notFound()` for any slug (D-22). `content/docs/{en,de}/.gitkeep`.
- Every root layout: `<html lang>`, `generateStaticParams = localeParams()` (`en`, `de`), `requireLocale()` guard. No `dynamicParams` anywhere.
- `app/global-not-found.tsx` (`experimental.globalNotFound`), dark, imports `globals.css`; EN copy with links to `/en` and `/de`.
- `app/[lang]/(dashboard)/not-found.tsx` and `app/[lang]/(docs)/not-found.tsx` – localized 404 for `notFound()` inside those layouts, using `lang()` from `next/root-params`.
- `proxy.ts` – redirects unprefixed paths to `/en|/de` + path + query (cookie `NEXT_LOCALE`, then `Accept-Language`, else `en`) and sets `NEXT_LOCALE` (path `/`, 1 year). Matcher `/((?!_next|(?:en|de)(?:/|$)|.*\\..*).*)` skips `_next`, files with an extension and paths starting with `/en` or `/de` (`/english` is still redirected).

**i18n** (`lib/i18n/`, D-19, D-21, D-32)

| File | What |
|---|---|
| `locales.ts` | `LOCALES`, `Locale`, `DEFAULT_LOCALE`, `isLocale` (guard), `LOCALE_COOKIE`, `localeParams()` |
| `require-locale.ts` | `requireLocale(value)` → `Locale` or `notFound()` (server) |
| `dictionaries.ts` | `AREAS`, `Area`, `Dictionary<A>` (type from the EN JSON), loader map |
| `get-dictionary.ts` | server-only `getDictionary(lang, area)`; DE deep-merged over EN (`deep-merge.ts`; an empty DE string counts as missing) |
| `dictionary-keys.ts` | `extraKeys(en, de)` (used by the test that DE has no keys EN lacks, for **all** areas) and `missingKeys(en, de)` (the DE to-do list for phase 11) |
| `negotiate-locale.ts`, `locale-path.ts`, `locale-cookie.ts` | proxy choice, `switchLocalePath`, `NEXT_LOCALE` cookie writer |
| `format/` (`index.ts`) | `formatNumber`, `formatQuantity`, `formatEur` (0 decimals by default, `compact`), `formatPercent` (**takes a fraction**: 0.25 → 25 %), `formatEnergy` / `scaleEnergy` (kWh → MWh → GWh, `perYear` adds `/a`), `formatSquareMeters`, `formatHectares`, `formatDate`, `formatDateTime`, `parseNumber`, `EMPTY_VALUE` (`–`) |

- `dictionaries/{en,de}/<area>.json` exist for all nine areas (`common`, `landing`, `start`, `shell`, `overview`, `quick-check`, `business-plan`, `assumptions`, `calc`); unused ones are `{}`. A test fails on a missing or stray area file.
- Intl locales: `en` → `en-GB` (day-month order, `€1,235`), `de` → `de-DE` (`1.234,5`, `1.235 €`).
- `parseNumber` rules: spaces/apostrophes ignored; with both `.` and `,` the last is decimal; a repeated separator is grouping; a single separator is decimal unless it is the UI language's group separator followed by exactly 3 digits (`1.234` = 1234 in DE, 1.234 in EN; `1,5` = 1.5 in both). Returns `null` for anything else.

**Dictionary pattern for later phases.** Server page/layout: `const lang = requireLocale((await params).lang)`, then `await getDictionary(lang, "area")`, then pass strings (or a client `I18nProvider`, phase 07) as props. Never import dictionary JSON in client code. Tests may import the EN JSON directly.

**Theme** (D-16)

- `lib/theme/theme.ts` (`THEME_STORAGE_KEY = "first-move:theme"`, `applyTheme`, `readStoredTheme`, `storeTheme`, `THEME_INIT_SCRIPT`) and `lib/theme/use-theme.ts` (`useTheme()` reads `<html data-theme>` via `useSyncExternalStore`, server snapshot `dark`; never reads storage during render).
- `components/theme/theme-script.tsx` (inline `<head>` script, dashboard and docs only), `theme-sync.tsx` (re-applies the stored theme after the dev Strict Mode remount, follows other tabs), `theme-toggle.tsx` (`<ThemeToggle labels={common.theme} />`).
- Every root layout renders `data-theme="dark"`; `(website)` has no script, so the landing is always dark. No `cookies()` read anywhere.

**Tokens** (`app/globals.css`, DESIGN-TOKENS §1–5, §7)

- Primitives unchanged; semantic tokens for dark (`:root, [data-theme=dark]`) and light (`[data-theme=light]`); shadcn names mapped onto them and exposed through `@theme inline` (`bg-background`, `text-primary`, `bg-hot`, `border-control-border`, `text-text-secondary`, `bg-ink-950`, `shadow-panel`, …). `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))`.
- Tailwind's default palette, shadows and breakpoints are removed (`--color-*: initial` etc.): only design colours exist (no new hues), radius tokens are all 0, and the only shadow is `shadow-panel`. Breakpoints: `sm` 768, `md` 900, `lg` 1101, `xl` 1200 px, so `max-sm:` = ≤ 767, `max-md:` = ≤ 899 (collapse nav), `max-lg:` = ≤ 1100, `max-xl:` = ≤ 1199.
- Focus: 2px `--ring` (cyan; Accent on light in light), offset 4px, globally in `@layer base`.
- Charts (D-17): `--chart-1` cyan, `-2` orange, `-3`/`-4` their 50 % tints, `-5` secondary text.
- Light palette, WCAG contrast on Paper 100 (computed from OKLCH):

| Token (light) | Value | Contrast |
|---|---|---|
| text | Ink 950 | 17.4:1 |
| secondary text | `oklch(0.35 0.025 220)` (§2 "Text secondary on light") | 9.7:1 |
| muted text (derived) | `oklch(0.47 0.025 220)` | 5.9:1 |
| cyan role | Accent on light `oklch(0.50 0.12 220)` | 4.8:1 (Paper 100 on it: 4.8:1) |
| orange (darkened, derived) | `oklch(0.54 0.15 45)` | 4.7:1 (Paper 100 on it: 4.7:1) |
| input border (derived) | Ink 950 / 0.45 | 3.1:1 |
| raised surface (derived) | `oklch(0.985 0.004 200)` | – |

  Dark form fields use `--input` = Paper 300 / 0.5 (3.2:1); the §2 Control border (1.75:1) stays on buttons and panels.

**shadcn** (`components/ui/`, D-15): button, card, input, label, select, tabs, tooltip, dialog, alert-dialog, dropdown-menu, sheet, sonner, chart, switch, slider, toggle, toggle-group, table, progress, badge, separator, skeleton, scroll-area, plus `lib/utils.ts` (`cn`) and `components.json`. Restyled to §5: 0 radius, flat, 1px lines, 44px targets, mono 12px uppercase labels, hover lift 170 ms ease-out with press scale, square 15px slider thumb on a 2px track, 2px progress bar. Additions: Button `hot` variant (orange; `destructive` is orange too), Badge outlined `default`/`hot`/`secondary`/`outline`, Tabs underline with `variant="hot"`, Toggle `hot`, Progress `tone="hot"`, Chart tooltip `valueFormatter` (pass a `lib/i18n/format` function), Toaster follows `data-theme` (no next-themes).

**Other shared components** (used by more than one layout, D-34): `components/language-switch/language-switch.tsx` (`<LanguageSwitch lang label names short />`, same path in the other locale, sets `NEXT_LOCALE`), `components/brand/brand.tsx`, `components/app-header/app-header.tsx` (docs header and the dashboard placeholder), `components/not-found/not-found-view.tsx`.

**MDX** (D-22): `@next/mdx` in `next.config.ts`, `pageExtensions` include `mdx`, `remark-gfm` passed as a string; `mdx-components.tsx` at the root. Checked with a temporary GFM probe page (table and strikethrough rendered), then removed.

**Headers** (D-14, `next.config.ts`): CSP without nonces (`script-src 'self' 'unsafe-inline'`, plus `'unsafe-eval'` in dev only; `connect-src 'self'`; `frame-ancestors 'none'`; `object-src 'none'`; `upgrade-insecure-requests` only on Vercel), `Referrer-Policy: no-referrer`, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Permissions-Policy`. No CSP violations on the landing (3D scene included), dashboard or docs.

**Stack installed now** (step 10, so parallel phases rarely touch the lockfile): zod 4, zustand 5, idb 8, recharts 3, radix-ui, class-variance-authority, clsx, tailwind-merge, sonner, server-only, @next/mdx 16.4.2, @mdx-js/loader, @mdx-js/react, remark-gfm; dev: vitest 5, @vitest/coverage-v8, @vitejs/plugin-react, jsdom, @testing-library/{react,dom,jest-dom,user-event}, fake-indexeddb, @playwright/test **1.63.0 exact**, katex (ships its own types), yaml, @types/mdx, tw-animate-css.

**Tests and scripts**

- `pnpm typecheck` = `next typegen && tsc --noEmit`; `pnpm test` = `vitest run`; `pnpm test:watch`; `pnpm test:e2e` = `playwright test`.
- `vitest.config.mts`: jsdom, `include **/*.test.{ts,tsx}`, excludes `e2e/**`, `.claude/**`, `.next/**`; Vite's native `resolve.tsconfigPaths` (no plugin); `server-only` aliased to its empty module so server modules are testable. `vitest.setup.ts`: jest-dom matchers, `fake-indexeddb/auto`, RTL cleanup, ResizeObserver/pointer-capture/scrollIntoView stubs for Radix and Recharts. Use `// @vitest-environment node` for `next/server` code (see `proxy.test.ts`). Mock `next/navigation` for components that call `usePathname`.
- `playwright.config.ts`: `e2e/`, Chromium from `/opt/pw-browsers`, `webServer` = `pnpm build && pnpm start`, port from `E2E_PORT` (default 3100) so parallel worktrees do not collide. `e2e/foundation.spec.ts` covers the phase verification.
- Worktrees (D-35): `.claude/worktrees/` in `.gitignore`; `.claude/**` excluded from ESLint, `tsconfig` and Vitest.

## Verification (plan)

- `pnpm build` passes; `/` → 307 `/en` (and `/de` with `Accept-Language: de` or the cookie); `/de` renders the landing (`lang="de"`, dark); `/en/dashboard` renders the placeholder in dark and, after the toggle, in light, and light survives a reload.

## Deviations

1. **shadcn CLI**: `ui.shadcn.com` is blocked by the egress proxy, so the components were written by hand from the official `new-york-v4` sources (read from GitHub raw) and restyled. `components.json` is in place for when the CLI can reach the registry.
2. **Base styles moved into `@layer base`.** The old unlayered element rules (`a`, `button { font: inherit }`, `body`, `:focus-visible`) would beat every Tailwind utility, breaking shadcn typography and links. The landing's own CSS stays unlayered, so it still wins; screenshots confirm no visual change.
3. **Tailwind defaults removed** (colours, shadows, breakpoints) to enforce the design rules; see Tokens.
4. **Extra files not in the plan**: localized `not-found.tsx` for `(dashboard)` and `(docs)`, `NotFoundView`, `Brand`, `AppHeader`, `ThemeScript`/`ThemeSync`. Without the not-found files, `notFound()` in `[step]`/docs pages shows Next's built-in English page.
5. **No hard-coded copy in shadcn**: Dialog/Sheet close buttons render only when a `closeLabel` prop is passed; Button `xs`/`icon-xs`/32px sizes dropped (44px minimum), `sm` keeps 44px height.
6. `vite-tsconfig-paths` not used (Vite 8 native option). `@types/node` raised to ^22 (Vitest 5 peer; Node 22 runtime).
7. Landing metadata stays in the `(website)` layout until phase 02 moves it to `landing.json`.
8. `gen:reference` is not added yet (phase 05 writes the script); `katex` and `yaml` are installed.

## Follow-ups

- **Status code for unlisted params**: with Cache Components + Partial Prefetching, `notFound()` for a param not in `generateStaticParams` (e.g. `/de/docs/missing`, and later an unknown QC/BP step) returns **200 on the first request** (the static shell has already streamed) and 404 afterwards. The localized not-found UI and `<meta name="robots" content="noindex">` are always correct. Phase 11 may revisit.
- Phase 02: the DE-has-no-extra-keys test already covers `landing` (step 6 needs no new helper). Use `LanguageSwitch` with `common.language` strings.
- Phase 07: replace `_start/start-placeholder.tsx`; the shadcn `sidebar` block was not in the list and is not installed.
- Phase 11: `missingKeys()` produces the per-area DE to-do list; check the dark Control border (1.75:1, a §2 token) against §7's 3:1 for UI boundaries.
- Vitest creates a jsdom per file (~1 s each). If the suite gets slow, try `pool: "vmThreads"`.
