---
id: PLAN-AGENT-02
date: 2026-10-24
status: done
challenge: [quick-check-tool, business-models]
covers: [D-07, D-15, D-59]
blocked_by: [PLAN-AGENT-01]
---

# Agents 02 · Collapsible sidebar

## Goal

On desktop (from `md`), the dashboard sidebar can collapse into an icon rail. Collapsed, every entry shows an icon, and hovering or focusing it shows the name in a tooltip. The choice is remembered and applied before the first paint, with no layout jump. The mobile sheet stays as it is.

## Requirements covered

D-07 (left sidebar, sheet on mobile), D-15 (tokens: 0 radius, 1px lines, 44px targets, cyan focus), D-59.

## Steps

1. **Read:** `app/[lang]/(dashboard)/dashboard/_components/sidebar/*`, `lib/dashboard/nav.ts`, `components/theme/theme-script.tsx` (pre-paint pattern), `components/ui/tooltip.tsx`, `app/[lang]/(dashboard)/layout.tsx` (cookie-notice offset), `docs/02_design/first-move_ui-design-tokens.md`.
2. **Icons for every entry** (`sidebar-nav.tsx` `ICONS`, one lucide icon per nav item id). Proposal: start `LayoutGrid`, overview `LayoutDashboard`, assumptions `SlidersHorizontal`, Quick Check area `Map`, buildings `Building2`, sources `Flame`, options `Settings2`, results `Gauge`; Business Plan opportunity `Lightbulb`, business-logic `Workflow`, reality-check `ClipboardCheck`, implementation `Rocket`. Expanded keeps today's step numbers; collapsed shows the icons in the module tone (cyan Quick Check, orange Business Plan, D-17). Test: every id from `navSections()` with both modules on has an icon.
3. **State.** `lib/dashboard/sidebar-state.ts`: storage key `first-move:sidebar` (`"collapsed"` or absent), read and write wrapped in try/catch. `SidebarScript` (co-located under `app/[lang]/(dashboard)/_components/`), rendered in the dashboard root layout `<head>` next to `ThemeScript`: before paint, sets `data-sidebar="collapsed"` on `<html>`. Toggling updates the attribute and storage; a `useSidebarCollapsed()` hook reads the attribute through `useSyncExternalStore` (server snapshot: expanded), so no storage is read during render.
4. **Layout.** Width `w-72` expanded, `w-16` collapsed, through `[data-sidebar=collapsed]` CSS (a Tailwind custom variant). Collapsed: labels stay in the DOM as `sr-only` (links keep their names), section titles become a short line in the section tone, `SidebarProject` becomes an icon button with the project name in its tooltip, the privacy note becomes a `ShieldCheck` icon with its text in a tooltip, `Brand` shows the mark only. The active indicator (2px bar) stays. The dashboard cookie-notice offset follows the width.
5. **Toggle.** A 44px button, always in the same place (footer row above the privacy note), `PanelLeftClose` / `PanelLeftOpen`, `aria-expanded`, `aria-controls` (the sidebar), label from `shell.json`. No keyboard shortcut.
6. **Tooltips.** Only when collapsed, `side="right"`, on hover and keyboard focus, text = section + label (for example "Quick Check · Buildings"), from the dictionaries.
7. **Copy and legal.** New keys in `dictionaries/en/shell.json` (DE may stay missing, D-32). Add `first-move:sidebar` to the Cookie Policy storage table (EN, and the DE draft, D-44) and to `lib/legal/facts.test.ts`.
8. **Tests:** unit (icons, state helpers, script with storage blocked), components (collapsed and expanded rendering, tooltip content, aria), e2e (toggle; reload keeps the state with the same sidebar width at first paint; tooltip on hover and on focus; axe in both states and both themes; mobile sheet unchanged; no horizontal overflow at 900 and 1440 px).

## Open questions this depends on

None.

## Verification

`pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`. Manual: collapse on `/en/dashboard/quick-check/buildings`, reload, the rail stays collapsed with no flash; tab through the rail and every tooltip names its page.
