---
id: NOTE-2026-10-24-phase-07-shell-and-start
date: 2026-10-24
author: Claude (phase 07 sub-agent)
relates_to: [PLAN-DASH-07, PLAN-DASH-00, QCT-SCOPE-06, QCT-SCOPE-10, BM-SCOPE-05, DESIGN-TOKENS, D-01, D-02, D-03, D-04, D-06, D-07, D-08, D-09, D-11, D-12, D-13, D-14, D-16, D-17, D-32, D-33, D-34]
---

# Phase 07 · Dashboard shell and start screen

Executed [PLAN-DASH-07](../plans/2026-10-24_dashboard-07_shell-and-start.md). `pnpm lint && pnpm typecheck && pnpm test && pnpm build` pass (286 test files, 1276 tests). `pnpm test:e2e` passes (10 tests, new `e2e/start.spec.ts` covers the plan's verification). No new dependency (Popover and Collapsible come from the installed `radix-ui`).

## Built

**Shell** (`app/[lang]/(dashboard)/dashboard/layout.tsx` + `_components/`, D-34)

- `layout.tsx` (server) loads `common`, `shell`, `calc`, `quick-check`, `business-plan` and hands them to `I18nProvider`; `DashboardShell` (client) calls `useStartProjectStore` once and frames every dashboard route.
- `i18n-provider.tsx`: `I18nProvider` (nested providers add areas), `useLocale()`, `useDictionary(area)` (throws when the area is not loaded), `useTextRef()` (registry `TextRef` → label). Pages add their own areas with a nested provider (the start page adds `start`).
- `store-provider.tsx`: `useStore()` (the provided store, else `getProjectStore()`), `useStoreState(selector)`. Tests pass their own store with `ProjectStoreProvider`.
- `sidebar/`: `Sidebar` (288px, sticky, from 900px), `MobileNav` (same content in a left sheet below 900px, with language and theme in its footer), `SidebarContent`, `SidebarProject` (open project, module badges, example tag), `SidebarNav` + `NavLink` (2px indicator in the module colour, step numbers 01–04). Model in `lib/dashboard/nav.ts` (`navSections(modules)`): module sections only when the module is on.
- `top-bar/`: `SaveStatus` (always visible; Paper + icon + text, orange + icon on error or storage warning, details in a tooltip and the accessible name), `ExportButton`, `ImportButton`, `ReportButton` (`aria-disabled`, still focusable, "coming soon" tooltip), `TopBar` (language switch, theme toggle, project menu). Text labels from 1200px, icons below; below 768px Export/Import/Report move into the project menu and language/theme into the sheet.
- `project-menu/`: `ProjectMenu` (rename, duplicate, modules, restore a version, link to a file when `fileLink.supported` with its status, close, delete), `RenameDialog`, `ModulesDialog` (shows the "keep at least one module" error), `RestoreDialog` (versions with time and reason).
- `project-actions/`: `useProjectActions()` (`open` → overview, `duplicate` "<name> (copy)", `exportProject` download + toast, `go(route)`), `DeleteProjectDialog` (confirm, then an Undo toast through `undoRemove`).
- `import/`: `ImportProvider` + `useImport().importFile(file)`: one flow for the top bar and the drop zone. Read and validate, show `ImportFailureDialog` (message + first bad fields by label), ask `ImportConflictDialog` on an id clash (keep both / replace / cancel), then `adoptImport` and go to the overview. Messages in `lib/dashboard/import-messages.ts`.
- `notices/notice-toasts.tsx`: every store notice becomes a toast (tab sync, export reminder with an Export action, reload-required with Reload); closing dismisses the notice.
- Shared pieces for later phases: `ProjectGate` (skeleton → "no project open" → "module is off" with a turn-on button → page), `PageHeader`, `PageSkeleton`, `EmptyState`, `PlaceholderPage`, `VerdictBadge` (§2 state mapping), `ModuleBadges`.
- `how-we-calculate/` (D-33): `HowWeCalculate` (collapsed disclosure, cyan or orange rule), `CalcInfo` (small info popover for KPI cards and result values; closes when Activity hides the route), `CalcExplanation` (the `calc` sentence, each formula with ID, name and MathML, the default tables), `FormulaMath` (injects `FORMULAS[id].mathml`; it accepts only a `FormulaId`). `formula-math.tsx` is on the allow list of `lib/storage/no-html-rendering.test.ts`.

**Routes** (placeholders for phases 08–10): `overview/page.tsx` (with `_components/module-map.tsx`, a link per module step), `quick-check/[step]/page.tsx` (area, buildings, sources, options, results), `business-plan/[step]/page.tsx` (BM-STEP-01..04), `assumptions/page.tsx`. Each `[step]` page has `generateStaticParams` and calls `notFound()` for unknown steps; no `dynamicParams`. All routes build as static (○) for both languages. QC input steps and Assumptions already show their `HowWeCalculate` from `STEP_EXPLAIN`.

**Start screen** (`page.tsx` + `_start/`): `StartScreen` = header, `StorageBanner` (`health.warning`), `ContinueCard` (last used project, large, last change, Continue → overview; a welcome note when there is none), `ImportDropZone` (drag and drop or picker), `PathTiles` + `PathTile` + `NewProjectDialog` (Quick Check / Business Plan / Both → name → create → first step), `ExamplesGallery` + `ExampleCard` (scenario, summary, facts, verdict badge, "Illustrative inputs only", open a copy), `ProjectList` + `ProjectRow` (open, duplicate, delete). Static parts render at once; data parts show skeletons until the store is ready.

**lib** (no JSX): `lib/dashboard/routes.ts` (`dashboardHref`, `QUICK_CHECK_PAGES`, `BUSINESS_PLAN_PAGES`, guards, `isActivePath`), `nav.ts`, `start-paths.ts` (`modulesFor`, `firstRoute`), `example-cards.ts` (verdicts from `run()` at build time), `change-time.ts` (`formatChangeTime`: time only today, else date and time), `validation-message.ts`, `import-messages.ts`; `lib/i18n/interpolate.ts` (`{name}` placeholders), `lib/i18n/lookup.ts` (dictionary by dot path).

**UI kit**: `components/ui/popover.tsx`, `collapsible.tsx`; `Toaster` now merges `toastOptions` (close button label from the dictionary). `vitest.setup.ts` stubs `setPointerCapture`.

**Copy** (EN only, D-32): `shell` (`nav`, `topBar`, `saveStatus`, `projectMenu`, `rename`, `duplicate`, `delete`, `modules`, `restore`, `export`, `importFlow`, `notices`, `gate`, `placeholder`, `loading`, `close`), `start` (rewritten: `meta`, `header`, `continue`, `paths`, `newProject`, `examples`, `import`, `projects`), `calc.ui`. DE files hold a few keys only; the stale `start.placeholder` keys were removed from both languages.

## Verified

Production build on port 3207, Playwright at 375 and 1440 px, dark and light, with a real example opened (school, kindergarten and flats; office and retail block): start screen empty and with Continue, overview, QC area with "How we calculate" open, project menu, mobile sheet, BP step. No console errors, no hydration warnings, no horizontal overflow. Fixes made after looking at the screenshots: the scenario label was truncated in the example card header and the verdict and button were cramped (the card is now stacked: scenario, text, verdict, full-width open row); block MathML was centred (now `display: inline math`, left-aligned); formula IDs were uppercased (`EQ-3.4A`); the sidebar border stopped at the viewport in long pages; the module badges wrapped in a 272px sidebar (now 288px); the project row truncated names on phones (now stacked); a redundant "No project open" in the menu trigger.

## Deviations and documented defaults

1. **Verification wording.** The plan says "reload: it lands on the start screen". The active project is kept per tab (PLAN-DASH-00), so reloading the overview stays on the overview with the project open. The e2e test checks: open an example → overview → reload (still open) → go to `/en/dashboard` → Continue reopens it. D-03 ("start screen at every visit") is met by `/dashboard` being the entry from the landing page.
2. **Start screen inside the shell.** The start screen uses the same layout (sidebar and top bar). The sidebar shows "All projects" plus the open project's pages; the top bar's Export and project menu act on the open project.
3. **"Both" opens the Quick Check first** (area), because BP step 1 shows QC numbers read-only (ALG-09).
4. **Assumptions belong to the Quick Check module** in the navigation and gate (they are the TBL-4..6 parameter playground, D-10).
5. **Close project** is an extra project-menu item (`store.close()`), so a tab can go back to "no project open".
6. **The layout loads `quick-check` and `business-plan`** dictionaries (about 20 KB), so import errors can name fields and later phases need no extra provider.
7. **Example cards** are computed on the server (`exampleCards(lang)` runs `run()` per example at build time); the click still uses `localizeExample` on the client to add the copy.
8. **Storage warning in headless Chromium**: the `not-persisted` banner and the orange save status appear there, because persistence is denied in that environment; that is the intended behaviour.
9. **Placeholder copy.** The placeholder pages show "In development" and a sentence from `shell.placeholder`; phases 08–10 replace them.

## Follow-ups

- Phase 08/10: replace the placeholder bodies in `quick-check/[step]/page.tsx`, `business-plan/[step]/page.tsx`, `assumptions/page.tsx`; keep `ProjectGate` around them. Put route components in `quick-check/_components/` or `[step]/_steps/<step>/` (D-34).
- Phase 09: replace `overview/_components/module-map.tsx` with the real overview; reuse `VerdictBadge` and `CalcInfo`.
- Phase 11: DE copy for `shell`, `start`, `calc.ui` (`missingKeys()`); e2e for export → delete → import; the "recently deleted" list (`listDeleted`) is still not shown in the UI.

## What later phases must know

- Client components read copy with `useDictionary(area)` and the language with `useLocale()`; numbers still go through `lib/i18n/format`, placeholders through `interpolate`.
- Read store data with `useStoreState(selector)` (stable selectors only) and act through `useStore()`; inputs change only via `useStore().patch(patch)`.
- Navigate with `useProjectActions().go(route)` and `dashboardHref(lang, route)`; never put the project id in the URL.
- "How we calculate": `import { HowWeCalculate, CalcInfo } from "../../_components/how-we-calculate"`; pass `STEP_EXPLAIN[step]` or `explainResult(key, run.flags)`; `tone="hot"` on Business Plan pages.
- Tests: `renderDashboard(ui, { store, lang })` and `testDictionaries(lang)` in `_components/test-utils/`, `fakeStore(state)` for states that are slow to reach; mock `next/navigation` (`useRouter`, `usePathname`) in each test file.
- Transient overlays (popover, dropdown, sheet) close in a `useLayoutEffect` cleanup, because Activity keeps hidden routes mounted.

## Next.js

`usePathname` in the sidebar needs no Suspense boundary because every dashboard route lists its params in `generateStaticParams` (`use-pathname.md`, Cache Components section). Activity guidance from `preserving-ui-state.md` is applied to transient overlays. No Next.js issue was hit.
