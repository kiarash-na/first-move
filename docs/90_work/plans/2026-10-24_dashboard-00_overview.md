---
id: PLAN-DASH-00
date: 2026-10-24
status: done
challenge: [quick-check-tool, business-models]
covers: [QCT-SCOPE-01, QCT-SCOPE-06, QCT-SCOPE-09, BM-SCOPE-05, DESIGN-TOKENS]
blocked_by: []
---

# First Move dashboard: overview

## Goal

Build a bilingual (EN/DE), browser-only Next.js dashboard. Each project has two optional modules, **Quick Check** and **Business Plan**, built strictly to `docs/`. Decisions `D-xx` and all OQ answers are in [NOTE-2026-10-24-owner-decisions](../notes/2026-10-24_owner-decisions.md).

## Requirements covered

All of `10_quick-check-tool/` and `20_business-models/`, split across phases 01–11 ([CONTEXT.md](CONTEXT.md)). **Not now:** the output document (button only, D-09), public docs content (D-22) and the file-ingestion agent (D-05).

## Steps (architecture every phase follows)

**Routes**

| URL | Root layout | Page |
|---|---|---|
| `/` | none | `proxy.ts` redirects to `/en` or `/de` (cookie `NEXT_LOCALE`, then `Accept-Language`, else `en`) |
| `/[lang]` | `app/[lang]/(website)/layout.tsx` | landing (always dark) |
| `/[lang]/dashboard` | `app/[lang]/(dashboard)/layout.tsx` | start screen |
| `/[lang]/dashboard/overview` | (dashboard) | overview |
| `/[lang]/dashboard/quick-check/[step]` | (dashboard) | `area` · `buildings` · `sources` · `options` · `results` |
| `/[lang]/dashboard/business-plan/[step]` | (dashboard) | `opportunity` · `business-logic` · `reality-check` · `implementation` |
| `/[lang]/dashboard/assumptions` | (dashboard) | defaults, OQ answers, parameter playground |
| `/[lang]/docs/[[...slug]]` | `app/[lang]/(docs)/layout.tsx` | public MDX docs (empty now) |

Every root layout sets `<html lang>` and lists `en` and `de` in `generateStaticParams`. Every `[step]` page and the docs `[[...slug]]` page also return their params from `generateStaticParams` and call `notFound()` for unknown values. Never export `dynamicParams`: with Cache Components it fails the build. `app/global-not-found.tsx` handles unmatched URLs. Page shells stay static (Cache Components), and project data is read on the client only. The active project is kept per tab in sessionStorage, falling back to the last-used project. It never goes in the URL.

**Folders** (co-location, D-34)

| Path | Holds |
|---|---|
| `app/[lang]/(website)/_components/` | landing components (moved from `components/landing/`), one per file |
| `app/[lang]/(dashboard)/dashboard/_components/` | shell shared by all dashboard routes: sidebar, top bar, `I18nProvider`, save status, project menu, `how-we-calculate/`, `charts/` |
| `app/[lang]/(dashboard)/dashboard/_start/` | start-screen components (only `/dashboard` uses them) |
| `app/[lang]/(dashboard)/dashboard/<route>/_components/` | components of one route: `overview`, `quick-check`, `business-plan`, `assumptions` |
| `app/[lang]/(dashboard)/dashboard/quick-check/[step]/_steps/<step>/` | one folder per QC step (same for `business-plan/[step]/_steps/`) |
| `app/[lang]/(docs)/` | public MDX docs layout and page |
| `components/ui/` | shadcn components (re-themed), used by every layout |
| `components/<name>/` | other components used by more than one layout only (`LanguageSwitch`, `ThemeToggle`) |
| `lib/i18n/` | locales, `getDictionary` (DE deep-merged over EN, D-32), `format` (numbers, units, dates, parsing) |
| `dictionaries/{en,de}/<area>.json` | one file per area: `common`, `landing`, `start`, `shell`, `overview`, `quick-check`, `business-plan`, `assumptions`, `calc` (How we calculate texts). DE may be partial (D-32). |
| `lib/project/` | Zod schema (one file per section), field registry, `applyPatch`, `createProject`, migrations |
| `lib/storage/` | IndexedDB, mirror, snapshots, tab sync, file link, export/import |
| `lib/store/` | Zustand store: projects, active project, save status |
| `lib/quick-check/` | `reference/` (generated from YAML), `equations/` (one file per EQ), `explain/` (generated MathML + plain-language keys per EQ, D-33), `classify/`, `overall-rule.ts`, `drivers.ts`, `run.ts` |
| `lib/business-plan/` | presets, guiding prompts, readiness, QC prefill |
| `lib/examples/` | one file per example project |
| `content/docs/{en,de}/` | public MDX (later) |

Private folders (`_x`) are not routes (Next.js colocation). Small files, one job each (D-24). Tests sit next to the unit they test (`x.ts` → `x.test.ts`). E2E tests go in `e2e/` and are excluded from Vitest. Dashboard pages load their area dictionaries on the server and pass them to a client `I18nProvider`. Never import dictionary JSON in client code.

**How we calculate (D-33).** One shared component (`_components/how-we-calculate/`) takes equation IDs and renders, collapsed by default: a plain-language sentence (`calc` dictionary) and the MathML of each equation with its ID. A small info popover variant is used on KPI cards and result values. Every QC step lists the equations its inputs feed; every result value lists the equations that produced it.

**Data model.** Shared data is stored once (D-01). Results are derived, never stored or exported.

```
Project
  meta          id, name, createdAt, updatedAt, schemaVersion, methodologyVersion, modules {quickCheck, businessPlan}, exampleId?
  site          name, location, siteType (free text, not the OQ-04 category), currentSupply[], stakeholders[]          BM-SCN-*, BM-STEP-01
  buildings     total QCT-IN-01 · areaM2 QCT-IN-02 · shares[type][period] QCT-IN-04
  sources       [{ id, potential }] QCT-IN-06/07 · pv QCT-IN-09
  quickCheck    manualDemand? QCT-IN-05 · networkLengthM? QCT-IN-08 · overrides? D-10
  businessPlan  scenarioId · opportunity · canvas · allocation · assumptions · criticalAssumptions · risks · refinements · scalability · nextSteps   BM-STEP-01..04
```

How the modules share data:
- `site`, `buildings` and `sources` feed the QC equations and BP step 1 (site, customer segments, heat sources).
- QC demand, revenue and investment appear read-only in BP steps 1 and 3 (ALG-09).

**Agent-ready fields (D-05).** Every input is declared once in `lib/project/fields/` with:
- id (dot path), module, step
- type, unit, min/max or enum
- requirement ID and i18n label key

The UI renders inputs from this registry. `applyPatch(project, patch)` validates through the same Zod schema. `z.toJSONSchema()` becomes the contract for a later ingestion agent.

**Stack.**
- Next 16.4: App Router, `proxy.ts`, Cache Components, Turbopack
- React 19.3, Tailwind v4, shadcn/ui, lucide-react
- Zod 4, Zustand, `idb`
- shadcn Charts (Recharts)
- Vitest, Testing Library, `fake-indexeddb`; `@playwright/test@1.63.0`, pinned exactly to match the preinstalled Chromium 1243 in `/opt/pw-browsers`
- `@next/mdx`

Add a dependency only when a phase needs it.

## How to run the phases (orchestrator; D-26, D-35)

1. Read [CONTEXT.md](CONTEXT.md). Every phase with `status: todo` whose `blocked_by` phases are all `done` may start. Independent phases run in parallel, each sub-agent in its own git worktree; dependent phases wait for their layer.
2. Spawn one sub-agent per phase with: *"Execute `docs/90_work/plans/<file>`. Follow PLAN-DASH-00 and the root CLAUDE.md."*
3. The sub-agent:
   1. Reads the phase file and the requirement files it cites.
   2. Builds the phase.
   3. Runs `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.
   4. Sets `status: done` in the phase file (the orchestrator updates the CONTEXT table, to avoid merge conflicts).
   5. Writes `notes/YYYY-MM-DD_phase-NN_<name>.md` (built, deviations, follow-ups).
   6. Commits (`phase NN: <name>`). A sub-agent on the session branch also pushes; one in a worktree only commits, and the orchestrator merges and pushes.
4. The orchestrator skims the note and diff, re-runs the checks after a merge, then starts the next layer. If a requirement has a gap, the sub-agent takes the documented default and logs it in the note. It never blocks.

## Open questions this depends on

None. OQ-01..OQ-26 are resolved.

## Verification

Phase 11 passes, and every requirement ID in `10_quick-check-tool/` and `20_business-models/` appears in at least one phase's `covers`.
