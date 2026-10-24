---
id: PLAN-DASH-07
date: 2026-10-24
status: todo
challenge: [quick-check-tool, business-models]
covers: [QCT-SCOPE-06, QCT-SCOPE-10, BM-SCOPE-05]
blocked_by: [PLAN-DASH-04, PLAN-DASH-06]
---

# Phase 07 · Dashboard shell and start screen

## Goal

The dashboard frame and a clear start screen where users pick a path, continue, import or open an example.

## Requirements covered

QCT-SCOPE-06 (flow entry), QCT-SCOPE-10 (report entry point), BM-SCOPE-05 (choose a scenario or your own); D-02, D-03, D-07, D-08, D-09, D-16.

## Steps

1. Shell in `app/[lang]/(dashboard)/dashboard/layout.tsx` + `_components/` (D-34):
   - sidebar (Overview · Quick Check steps · Results · Business Plan steps · Assumptions; a sheet below 899px). Module sections show only when the module is on.
   - top bar: `SaveStatus` (always visible), Export, Import, Report (disabled with a "coming soon" tooltip), `LanguageSwitch`, `ThemeToggle`, `ProjectMenu` (rename, duplicate, delete with confirm + undo, turn modules on/off, restore snapshot, link to a file when supported).
   - toasts for the tab-sync notice and the export reminder
   - placeholder pages for every `/[lang]/dashboard/*` route in PLAN-DASH-00 (filled in phases 08–10); opening a project or example goes to overview
2. Start screen at `/[lang]/dashboard` (`page.tsx` + `_start/`):
   - **Continue where you left off**: large card for the last project, with its time
   - path tiles Quick Check / Business Plan / Both → name dialog → create → first step
   - examples gallery (6 cards with a verdict badge and "Illustrative inputs only")
   - import (drag & drop or file picker)
   - project list (open, duplicate, delete)
   - storage-warning banner
3. Also build the shared `_components/how-we-calculate/` (collapsible + info popover, D-33) so phases 08–10 only use it. One component per file. Skeletons until client data is ready, and no storage reads during render.
4. Tests: each component renders in EN and DE; a path tile creates the right modules; Continue opens the last project; import errors are shown.

## Open questions this depends on

None.

## Verification

From `/en` → Dashboard → open an example → reload: it lands on the start screen and Continue reopens the example.
