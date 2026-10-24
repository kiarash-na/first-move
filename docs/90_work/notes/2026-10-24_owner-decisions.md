---
id: NOTE-2026-10-24-owner-decisions
date: 2026-10-24
author: project owner (answers), Claude (record)
relates_to: [PLAN-DASH-00, OQ-01, OQ-02, OQ-03, OQ-04, OQ-05, OQ-06, OQ-07, OQ-08, OQ-09, OQ-10, OQ-11, OQ-12, OQ-13, OQ-14, OQ-15, OQ-16, OQ-17, OQ-18, OQ-19, OQ-20, OQ-21, OQ-22, OQ-23, OQ-24, OQ-25, OQ-26]
---

# Owner decisions for the dashboard build

Answers given by the project owner in chat on 2026-10-24. The plan is [PLAN-DASH-00](../plans/2026-10-24_dashboard-00_overview.md). OQ answers are also written into each OQ file (`status: resolved`).

## Product

| ID | Decision |
|---|---|
| D-01 | One **project** with two optional **modules** (Quick Check, Business Plan). Shared data is stored once (see PLAN-DASH-00 § Data model). |
| D-02 | Several named projects per browser. Warn before any action that can lose data. |
| D-03 | Start screen at every visit: path tiles (Quick Check / Business Plan / Both), a prominent **Continue where you left off**, Import file, **Examples**, project list. |
| D-04 | Examples matter most for the demo: 6 illustrative projects, both modules filled (4 from BM-SCN-01..04 + 2 extra promising). Picking one creates a copy. |
| D-05 | Quick Check input is a stepper with live results. Every field must be **agent-operable** (typed field registry + one patch function) so a later agent can fill it from dumped files. Ingestion agent itself is **not** built now. |
| D-06 | Overview: verdict banner + drivers, big icon KPI cards, small secondary tiles, 3 default charts, more charts on click. |
| D-07 | Left sidebar navigation (sheet on mobile). |
| D-08 | Top-right bar: autosave status (always visible), Export, Import, Report, Language, Theme, Project menu. No manual Save button. |
| D-09 | Report button is shown but disabled ("coming soon"). PDF/report export is built after everything else is tested. |
| D-10 | Defaults (TBL-1..6) read-only; a **Play with parameters** toggle may override TBL-4/5 (capacity, COP) and TBL-6. TBL-7..11 thresholds stay fixed. Overridden results show a "Custom parameters" badge; one-click reset; overrides saved in the project. |

## Data safety

| ID | Decision |
|---|---|
| D-11 | IndexedDB primary + localStorage mirror + `navigator.storage.persist()` + 20 rolling snapshots with restore + cross-tab sync + unload guard + export reminder. |
| D-12 | Optional "Link to a file" autosave via File System Access API (Chromium only, hidden elsewhere), only if it stays simple for the user. |
| D-13 | Export `.firstmove.json`: inputs only + `schemaVersion` + `methodologyVersion`; results recomputed on import; old files migrated. |
| D-14 | No backend, no passwords. User data never leaves the browser. Imports are schema-validated (size limit, never rendered as HTML). CSP headers. |

## Design, language, tech

| ID | Decision |
|---|---|
| D-15 | Brand per DESIGN-TOKENS; shadcn/ui fully re-themed (0 radius, flat, 1px lines, 44px targets, cyan focus). |
| D-16 | Dark is default. Light/dark toggle in dashboard and docs; landing stays dark. Light palette is derived from the report/light tokens. |
| D-17 | Chart colors: cyan/orange + tints + Paper greys, plus labels/patterns. No new hues. Status colors: Paper + icon + text; errors orange + icon. |
| D-18 | Charts: shadcn Charts (Recharts) lazy-loaded + small custom SVG gauges/bullet bars. |
| D-19 | EN + DE for everything visible, **including the landing page** (moved to `/[lang]`; `/` redirects by cookie, then browser language, else EN). Internal `docs/` stays English. |
| D-20 | Landing: rename "5GDHC OS" to **First Move**; CTAs open the dashboard. |
| D-21 | Numbers formatted per language (`1.234,5` in DE), auto-scaled units (kWh → MWh → GWh); inputs accept both separators. User free text stored as typed. |
| D-22 | Public MDX docs: pipeline + empty routes now; content and its translation later. |
| D-23 | A unit test for every unit (Vitest) + one Playwright run (onboarding → example → dashboard → export → reload → import). |
| D-24 | Small files: one component per file, one equation per file, one step per file; separate folders per area. |
| D-25 | Hosting: Vercel. |
| D-26 | Delivery: one sub-agent per phase, phases run one after another; each phase commits and pushes. PR only when the owner says so. |
| D-27 | Business Plan is a qualitative workspace. QC economics are shown read-only; no BP-specific calculations. |
| D-28 | Business Plan steps: free navigation with progress per step. |
| D-29 | One business model per project; models are compared by duplicating the project. |
| D-30 | Pitch-readiness checklist built from the V02 pitch sections + V01 jury criteria, labelled unofficial. |
| D-31 | QC inputs: the share grid starts empty with a live sum; area is entered in m², with ha shown; the team sets the validation limits. |

## Defaults added in plan review (2026-10-24)

| ID | Default |
|---|---|
| R-01 | A source with Unknown potential adds 0 supply, cost and electricity (QCT-RULE-UNKNOWN still forces the result). |
| R-02 | N_total terms (EQ-3.3, EQ-3.9c, EQ-3.10d) use the entered total, industry included (the result is forced anyway, OQ-02). |
| R-03 | The share sum must equal 100 (float tolerance only); otherwise the project is incomplete and shows no result. |

## Open questions answered

All answers are the defaults proposed in chat and accepted by the owner.

| OQ | Answer |
|---|---|
| OQ-01 | Divide % values by 100; N_i,p may be fractional. |
| OQ-02 | Industry selectable; share > 0 forces "Further analysis required"; no demand/area/revenue from industry. |
| OQ-03 | Labels shown verbatim; no logic depends on 1919. |
| OQ-04 | Not an input; derived from TBL-8 class (Low → rural, Medium → sub-urban, High → urban), read-only. |
| OQ-05 | Two optional totals (kWh/a) replace EQ-3.2c/d results. |
| OQ-06 | PV yes/no toggle; yes → C_el × 0.7. |
| OQ-07 | Q_cool,total is cooling demand. |
| OQ-08 | Indices read by context (see OQ file). |
| OQ-09 | N_ha = ρ_building. |
| OQ-10 | Classify ρ_heat in MWh/m (kWh/m ÷ 1000). |
| OQ-11 | Several sources; supplies summed; costs per source summed. |
| OQ-12 | CH = min(Q_cool, Q_heat) / max(Q_cool, Q_heat); UI names the dominant demand. |
| OQ-13 | Solar thermal: supply = capacity, no electricity. No cooling from waste heat / solar thermal. |
| OQ-14 | COP_H = TBL-4 COP, COP_C = TBL-5 COP of the source. |
| OQ-15 | p_C,energy = cooling energy price (TBL-6). |
| OQ-16 | Base prices are €/m² per year. |
| OQ-17 | C_overall = C_HP·N_total + C_net + C_i,total. |
| OQ-18 | Ambient air installation cost = 0, flagged in Assumptions. |
| OQ-19 | C_el in €/a. |
| OQ-20 | Lower bound inclusive, no gaps (see OQ file). |
| OQ-21 | E = R_overall / (C_annual + C_el + C_O&M); ≥ 1.0 favorable, < 0.7 clearly unfavorable. |
| OQ-22 | Forced rules → Not promising → Promising → else Further analysis; relevant = demand > 0. |
| OQ-23 | 6 illustrative example projects, labelled "Illustrative inputs only". |
| OQ-24 | Web application. |
| OQ-25 | BM-SCN-01..04 as presets (stated fields only) + custom use case. |
| OQ-26 | TBL-4/5 capacities used verbatim (absolute per source); flagged; organisers to be asked. Check: "Promising" is reachable for ~2–15 buildings with several medium/high sources. |
