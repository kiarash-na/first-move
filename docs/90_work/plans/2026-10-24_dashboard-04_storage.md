---
id: PLAN-DASH-04
date: 2026-10-24
status: done
challenge: [quick-check-tool, business-models]
covers: [QCT-SCOPE-11]
blocked_by: [PLAN-DASH-03]
---

# Phase 04 · Local storage and data safety

## Goal

Users never lose data: autosave, recovery, snapshots, multi-tab safety, export/import. Nothing leaves the browser.

## Requirements covered

D-02, D-08 (save status), D-11, D-12, D-13, D-14; usability per QCT-SCOPE-11.

## Steps

1. `lib/storage/`, one job per file:
   - `idb.ts`: projects and snapshots stores
   - `mirror.ts`: localStorage copy of each project's latest state
   - `persist.ts`: `navigator.storage.persist()` and `estimate()`; returns a warning state when denied or low
   - `snapshots.ts`: 20 rolling per project, restore
   - `tab-sync.ts`: BroadcastChannel; a newer write from another tab triggers a notice
   - `unload-guard.ts`: warns while a write is pending
   - `recovery.ts`: on load, IndexedDB → mirror → latest snapshot
   - `reminder.ts`: export reminder after N edits or days
   - `file-link.ts`: File System Access autosave; feature-detected, so the UI is hidden when unsupported (D-12)
2. `export.ts` / `import.ts`:
   - `.firstmove.json` holds inputs only, plus versions.
   - Import enforces a 5 MB limit, validates with Zod and runs migrations.
   - Errors list the bad fields. Imported text is never rendered as HTML.
3. `lib/store/` (Zustand):
   - projects list, active project (per-tab sessionStorage, last-used fallback)
   - autosave debounced 400 ms
   - `saveStatus`: saving / saved at / error / storage-warning
   - Create, rename, duplicate and delete (delete keeps a snapshot, so undo works).
4. Client-only access through `useSyncExternalStore` with an empty server snapshot. Effects must be idempotent, because Cache Components keeps routes mounted with Activity.
5. Tests (`fake-indexeddb`): write/read, mirror fallback, snapshot rotation and restore, tab-sync messages, export/import round trip, oversize/invalid/old-version imports, debounce.

## Open questions this depends on

None.

## Verification

Kill the tab mid-edit and reload: no data is lost (also covered by the phase 11 e2e test).
