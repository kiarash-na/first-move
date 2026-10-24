---
id: NOTE-2026-10-24-agents-02-sidebar
date: 2026-10-24
author: Claude (phase A02)
relates_to: [PLAN-AGENT-02, D-07, D-15, D-59]
---

# Agents 02 · Collapsible sidebar

From 900px the dashboard sidebar collapses into a 64px icon rail and expands again. The choice is kept in `first-move:sidebar` and drawn before first paint, so a reload shows the rail at once and nothing moves at hydration. The mobile sheet is unchanged.

## What was built

| Part | Where |
|---|---|
| State: key `first-move:sidebar` (`"collapsed"`, removed when expanded), `<html data-sidebar="collapsed">`, storage in try/catch, the pre-paint script string | `lib/dashboard/sidebar-state.ts` |
| `useSidebarCollapsed()`: reads the attribute through `useSyncExternalStore` (server snapshot: expanded), setter applies and stores | `lib/dashboard/use-sidebar-collapsed.ts` |
| `SidebarScript` in the dashboard root layout `<head>`, after `ThemeScript` (same inline-script helper) | `app/[lang]/(dashboard)/_components/sidebar-script.tsx`, `app/[lang]/(dashboard)/layout.tsx` |
| CSS: `rail:` custom variant, `&:where([data-sidebar=collapsed] [data-slot=sidebar] *)`; `--sidebar-width` 18rem, 4rem on `:root[data-sidebar="collapsed"]` | `app/globals.css` |
| Rail context: the desktop sidebar's id, state and setter for its parts; null in the sheet | `sidebar/rail.ts`, provided by `sidebar/sidebar.tsx` |
| Toggle: 44px, footer row above the privacy note, `PanelLeftClose` / `PanelLeftOpen`, `aria-expanded`, `aria-controls`, no shortcut | `sidebar/sidebar-toggle.tsx` |
| Tooltips: right side, hover and keyboard focus, only while collapsed (the toggle in both states), text "Section · Page" | `sidebar/rail-tooltip.tsx`, `nav.rail.entry` |
| One icon per nav entry, as proposed in the plan | `sidebar/nav-icons.ts` |
| Collapsed entries: icon in the module tone (also on hover), label kept as `sr-only`, 2px indicator kept; section titles become a 1px line in the section tone and stay the lists' names | `sidebar/nav-link.tsx`, `sidebar/sidebar-nav.tsx` |
| Project and privacy note as rail icons with their text in the tooltip | `sidebar/rail-reveal.tsx`, `sidebar/sidebar-project.tsx`, `sidebar/sidebar-privacy.tsx` |
| Brand shows the mark only, named in a tooltip | `sidebar/sidebar-content.tsx`; `components/brand/brand.tsx` passes other link props and the ref through, plus `nameClassName` |
| Dashboard cookie notice offset follows the width: `md:left-[calc(var(--sidebar-width)_+_1rem)]` | `app/[lang]/(dashboard)/layout.tsx` |
| Copy `nav.rail.*` (collapse, expand, entry, project, privacy); DE falls back to EN (D-32) | `dictionaries/en/shell.json` |
| Legal and storage checks use the constant | `lib/legal/facts.test.ts`, `lib/storage/keys.test.ts`, `lib/storage/keys.ts` (comment) |
| e2e | `e2e/sidebar.spec.ts` (new), `e2e/support/axe.ts` (`except` option), `e2e/legal.spec.ts` (key in the Cookie Policy list) |

## How the first paint stays right

1. `SidebarScript` runs while the HTML is parsed and sets `data-sidebar="collapsed"` on `<html>` when the key says so.
2. CSS draws everything from that attribute: the width (`--sidebar-width`), labels and section titles (`rail:sr-only`), the line markers and icons (`hidden rail:block`), the brand name (`rail:hidden`), the toggle icon. With every JavaScript chunk blocked, the static page already shows the rail (e2e).
3. React reads the attribute only through `useSyncExternalStore`, with "expanded" as the server snapshot, so hydration matches the static shell. Its value drives only what CSS cannot: `aria-expanded`, the toggle's label and whether tooltips open.
4. The sidebar puts a stored collapse back on `<html>` in a layout effect. The preventing-flash-before-hydration guide warns that React's dev remount can reset the attributes of `<html>`; in production this is a no-op. No storage is read during render.

## Decisions and deviations

- **Width through a CSS variable**, not `w-72` / `w-16` classes: `--sidebar-width` (18rem = `w-72`, 4rem = `w-16`) also offsets the dashboard cookie notice, so the two cannot drift apart.
- **The variant is scoped to the desktop sidebar** (`[data-slot=sidebar]`). The sheet renders the same parts outside that landmark, so it never matches, even while `<html>` says collapsed (collapsed on desktop, then a narrow window). Elements that only the rail needs (section lines, step icons, the project and privacy icon buttons, the toggle, tooltips) render only inside the desktop sidebar, so the sheet gets no new elements, only inert class names.
- **Tooltips keep Radix's own open state.** While the sidebar is expanded, the trigger's `pointermove` and `focus` are marked handled, so Radix skips them. A controlled first version (`open={collapsed && open}`) failed in e2e: Radix compares its `setOpen(false)` with the last rendered prop, so a hover and a click within one frame left the toggle's tooltip open; its hidden "open" state also switched off the provider's open delay.
- **The project and privacy icons expand the sidebar when pressed and move focus to the revealed part** (`tabIndex={-1}`, inset 2px cyan outline), so focus never disappears with the hidden button. The plan only named them icon buttons with a tooltip; a button that does nothing seemed wrong. Like the toggle they carry `aria-expanded` and `aria-controls`. Their names: "Current project: {name}" (or "No project open") and "About your data".
- **The toggle's label follows the state** ("Collapse sidebar" / "Expand sidebar") as accessible name and tooltip, together with `aria-expanded`. It shows its tooltip in both states, since it is an icon in both. It keeps its x position; its y moves by the height difference between the privacy text (expanded) and the shield button (collapsed), a few pixels.
- **The brand link names itself in the rail** ("First Move, back to the website"), so every stop in the collapsed rail has a tooltip.
- **Icons in their own file** (`nav-icons.ts`, not `sidebar-nav.tsx`), so the coverage test needs no component. Start (`LayoutGrid`) and Overview (`LayoutDashboard`) look alike at 18px, as they already did expanded; the tooltips tell them apart.
- **No width animation.** The rail switches at once. A width transition would lay out the main area, charts included, on every frame, and could replay whenever React's dev remount resets the attribute.
- **No sync across tabs** (unlike the theme): another tab picks up the choice on its next load.
- **Legal:** the Cookie Policy 1.1 already lists the key in EN and the DE draft, and its wording matches the stored value. `lib/legal/facts.test.ts` did not check it yet; it now checks `SIDEBAR_STORAGE_KEY`, and `lib/storage/keys.test.ts` includes it in the namespaced-and-distinct check. No legal copy changed.
- `lib/storage/no-html-rendering.test.ts` allow-lists `sidebar-script.tsx`: like the theme script it injects a build-time string, never user data.
- `e2e/support/axe.ts` gets an `except` option. The sidebar spec turns off only `region`, only for the run with a tooltip open: Radix portals tooltips to `<body>`, outside the landmarks, as for every tooltip in the app.

## Follow-ups

- DE copy for `nav.rail.*` is missing (D-32). The generated DE review note was already stale before this phase (the `assistant` and `mail` areas from A01); run `pnpm gen:de-review` once the parallel phases are merged.

## Verification

- `pnpm lint`, `pnpm typecheck`: clean.
- `pnpm test`: 489 files, 2159 tests, all green (before this phase: 480 files, 2091 tests).
- `pnpm build`: green. First-load JS of the overview 1,018,127 bytes uncompressed, against 1,011,105 for the commit before this phase (+7.0 kB; the budget test allows 1,150,000). The start page grows by 7.6 kB.
- `E2E_PORT=3200 pnpm test:e2e`: 104 of 104 passed in 1.4 minutes, including the 12 new tests in `e2e/sidebar.spec.ts`: toggle and stored value, the toggle's place and size, the first-paint width after a reload with no layout shift, the rail without any JavaScript chunk, tooltips on hover and on keyboard focus (none while expanded), the project and privacy icons, axe expanded and collapsed in both themes (also with a tooltip open), no horizontal overflow at 900 and 1440 px in both states, the mobile sheet measured the same in both states, the cookie notice at 304 px and then 80 px. The sidebar spec also passed 36 of 36 with `--repeat-each 3`.
- Manual, production server at 1440 × 900: screenshots of both states in both themes. Collapsed on `/en/dashboard/quick-check/buildings` and reloaded, the rail stays with no flash. A keyboard walk through the rail (dark theme) gets a tooltip at every stop: brand, project, every entry as "Section · Page", toggle, privacy. Enter on the project icon expands the sidebar with focus on the project details.
- Manual, `pnpm dev`: the stored collapse survives reloads and the switch to German; the console stays clean.

## Review fixes

One reviewer checked the phase: 4 findings, 4 fixed, 0 rejected. Each was reproduced before it was fixed: the two new e2e tests failed against a production build of the unfixed commit, and each new unit test fails with its fix reverted.

| # | Finding | Outcome |
|---|---|---|
| 1 | Expanding the rail could push the current page's link out of view, which brought phase 11 QA item 8 back: `revealActiveLink` ran only when the route or the modules changed. At 1440 × 900 with both modules on, "Expand sidebar" on Implementation left the link below the visible window. The project and privacy icons expand the same way | **Fixed.** `SidebarContent` also reveals the link when the rail's state changes (`useRail()?.collapsed` in the effect's deps; undefined in the mobile sheet). React's copy changes only after `<html data-sidebar>`, which CSS draws from, so the effect reads the final layout. Unit test: toggling the rail reveals again, a new context value in the same state does not. e2e: collapse on Implementation at 1440 × 900, reload, then expand by the toggle, the project icon and the privacy icon; each time the `aria-current` link is hit-testable. The `elementFromPoint` check is now `e2e/support/hit.ts`, shared with `review-fixes.spec.ts` |
| 2 | The 64px rail's nav still overflows at laptop heights. Where scrollbars are classic (Chrome and Edge on Windows, 1366 × 768), the scrollbar took a quarter of the rail, the icons moved about 8px off the brand, project, toggle and privacy icons, and the hover and active background stopped at the scrollbar | **Fixed.** The scrollbar is hidden only in the rail: `rail:scrollbar-none` (`scrollbar-width: none`, Chrome and Edge 121+, Safari 18.2+), plus `rail:[&::-webkit-scrollbar]:hidden` for the older browsers Next.js 16 supports (Chrome and Edge 111+, Safari 16.4+). The built CSS has `.rail\:scrollbar-none:where([data-sidebar=collapsed] [data-slot=sidebar] *){scrollbar-width:none}` and `…:where([data-sidebar=collapsed] [data-slot=sidebar] *)::-webkit-scrollbar{display:none}`, with the pseudo-element last. The other variant order (`[&::-webkit-scrollbar]:rail:`) would put `:where()` after it, which is invalid. The wheel, the keyboard and `revealActiveLink` still scroll the rail, and the expanded sidebar keeps its scrollbar. New `e2e/sidebar-scrollbars.spec.ts` runs Chromium without `--hide-scrollbars`, so it draws classic 15px scrollbars. That is a launch option, which Playwright accepts only for a whole file. At 1366 × 768 it checks: a 15px scrollbar when expanded, none in the overflowing rail, every entry 63px wide with its icon in line with the toggle, the current page revealed, and the wheel and Tab both scroll. Checked by hand too: with `scrollbar-width` forced back to `auto`, the WebKit rule alone keeps the rail free of a scrollbar |
| 3 | The toggle flipped React's state (`!rail.collapsed`), not the page's. Until hydration catches up, React holds the server snapshot (expanded) while CSS already draws the rail, so an early click "collapsed" a collapsed rail and the user's expand was lost | **Fixed.** The toggle flips what the page shows: `rail.setCollapsed(!isSidebarCollapsed())`. The doc of `Rail.collapsed` says that handlers read the attribute. Unit test: with `data-sidebar="collapsed"` on `<html>` and the context still expanded, a click calls `setCollapsed(false)` |
| 4 | The phase table still listed A02 as `todo` | **Fixed.** `docs/90_work/plans/CONTEXT.md` now says `done`, matching the plan's frontmatter |

The e2e sidebar locators (`sidebar`, `toggle`, `entry`, `current`, `scroller`, `collapse`) moved to `e2e/support/sidebar.ts`, which both sidebar specs use.

Checks after rebasing on `main` (A03 and the two dependency commits): `pnpm lint` and `pnpm typecheck` clean; `pnpm test` 523 files, 2389 tests; `pnpm build` green. `E2E_PORT=3300 pnpm test:e2e` ran twice on the same build while parallel jobs loaded the machine (load average 19 to 28 on 12 cores): 104 of 106 passed, then 105 of 106. Each run lost different landing-page tests, none of which touches the dashboard: first `legal.spec.ts` (the footer's Imprint link, the landing cookie notice), then `start.spec.ts` ("Get Started"). Each time the landing page answered too slowly: a clicked link had not navigated after 5 seconds, or the test hit its 30-second limit. Each of them passed on a re-run, and every sidebar test passed in both runs.
