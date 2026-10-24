---
id: NOTE-2026-10-24-phase-04-storage
date: 2026-10-24
author: Claude (phase 04 sub-agent)
relates_to: [PLAN-DASH-04, PLAN-DASH-00, QCT-SCOPE-11, D-02, D-03, D-05, D-08, D-11, D-12, D-13, D-14, D-29, D-32, D-34]
---

# Phase 04 · Local storage and data safety

Executed [PLAN-DASH-04](../plans/2026-10-24_dashboard-04_storage.md). `pnpm lint && pnpm typecheck && pnpm test && pnpm build` pass (161 test files, 752 tests; new: 32 files in `lib/storage/`, 26 in `lib/store/`, 224 tests). No new dependency (`idb`, `zustand`, `zod`, `fake-indexeddb` were installed in phase 01). No route uses the store yet (phase 07 mounts it); a temporary probe page plus a Playwright run in real Chromium (port 3104, removed before commit) confirmed IndexedDB and mirror writes, restore after reload, cross-tab sync and no console or CSP errors.

## Built

**`lib/storage/`** (no React, no network; one job per file)

| File | What |
|---|---|
| `keys.ts`, `limits.ts`, `types.ts` | DB name/version, store names, web-storage keys, channel; all limits and timings; record types, `SNAPSHOT_REASONS`, `StorageMode` |
| `idb.ts` | `openStorageDb()` (stores `projects` with out-of-line keys and raw JSON values, `snapshots` with an auto-increment key and a `projectId` index, `backups`, `file-links`); resolves `null` when IndexedDB is missing, throws, or does not answer within 5 s; `onClosed` when another tab opens a newer DB version |
| `save-project.ts` | One atomic transaction: snapshot the replaced state if needed, put, rotate, count the edit |
| `delete-project.ts` | One transaction: "before-delete" snapshot of the newest state, then delete record, bookkeeping and file link |
| `snapshots.ts` | 20 rolling per project, list (newest first, without data), get, `listDeletedProjects`, `deleteSnapshots` |
| `mirror.ts` | localStorage copy `first-move:mirror:<id>` = `{ savedAt, project }`; when storage is full it drops the oldest *other* copies |
| `read-stored.ts` | Validates any stored copy: `migrateProject` plus "filed under its own id" |
| `recovery.ts` | On load: IndexedDB record → mirror → newest valid snapshot (pure; the caller writes back) |
| `persist.ts` | `navigator.storage.persisted/persist/estimate` → `StorageHealth` with `warning`: `unavailable` · `low-space` (< 10 MB free or > 90 % used) · `not-persisted` (only after asking was denied) |
| `tab-sync.ts` | BroadcastChannel `first-move:storage`; messages `saved {projectId, updatedAt}` / `deleted {projectId}`, validated with Zod; drops its own messages; does nothing without BroadcastChannel |
| `unload-guard.ts` | Flushes on `pagehide` and on `visibilitychange` → hidden; while armed, `beforeunload` flushes and shows the browser prompt only if the changes could not be kept anywhere |
| `reminder.ts`, `backups.ts` | Export reminder rules (pure) and their IndexedDB bookkeeping |
| `file-link.ts`, `file-link-records.ts` | File System Access: feature detection (Chromium, secure, top level), pick (`.json`, cancel → null), permission (query, or request on click), write; handles kept in IndexedDB |
| `export.ts`, `file-name.ts`, `download.ts` | `.firstmove.json` envelope, `<slug>-<YYYY-MM-DD>.firstmove.json` (umlauts transliterated), download through a local object URL |
| `import.ts` | `readImportFile(blob)` / `parseImportText(text)` → `ImportResult` |
| `repository.ts` | The facade the store uses: `loadAll`, `read`, `save` (mirror first, then IndexedDB), `mirror` (sync), `remove`, `purge`, snapshots, bookkeeping, file links; modes `indexeddb` · `mirror-only` · `memory` |
| `save-error.ts`, `web-storage.ts` | Error codes; safe access to Web Storage (probe write, quota detection) |
| `test-utils/` | `MemoryStorage` (quota, blocked), `uniqueDbName`, `fakeFileLink`, `testProject`/`edited` (test helpers only) |

**`lib/store/`** (Zustand vanilla store, client only)

- `create-project-store.ts`: `createProjectStore(deps)` → state + actions: `start`, `create`, `addCopy` (examples), `duplicate`, `open`, `close`, `patch` (sync `PatchResult`), `patchProject`, `rename`, `remove` → `DeleteReceipt`, `undoRemove`, `purge`, `listSnapshots`, `listDeleted`, `restoreSnapshot`, `exportProject`, `importFile`, `adoptImport`, `flush`, `dismissNotice`, `refreshHealth`, `linkFile`, `resumeFileLink`, `unlinkFile`. Actions live in `actions/` (one concern per file).
- `state.ts`: `ProjectStoreState` = `phase` (`idle` · `loading` · `ready`), `mode`, `projects` (summaries, newest first), `activeId`/`active`, `lastUsedId`, `save` (`state`, `savedAt`, `error`, `mirrored`), `health`, `notices`, `fileLink`. `INITIAL_STATE` is frozen and is the server snapshot.
- `autosave.ts` + `debounce.ts`: one autosave per project with unsaved edits; saves 400 ms after the last edit, one write at a time (the newest full state wins), retries a failed save after 5 s, `flushSync` for unload.
- `save-status.ts`: `selectSaveStatus` → `idle` · `saving` · `saved {at}` · `error {code, mirrored}` · `storage-warning {warning, at}` (memoized, so it is a stable selector).
- `active-ids.ts`: active project per tab in sessionStorage (`first-move:active-project`), last used in localStorage (`first-move:last-project`). On start: this tab's id, else the last used one; never in the URL.
- `use-project-store.ts`: `useProjectStore(selector)` = `useSyncExternalStore` with `INITIAL_STATE` as server snapshot; `useStartProjectStore()` starts once (idempotent, no cleanup), so Activity and Strict Mode re-runs do nothing (`preserving-ui-state.md`: hidden routes run effect cleanups).
- `project-store.ts`: `getProjectStore()` singleton; creating it touches no browser API. `deps.ts`: `browserDeps()` (everything lazy).

**Copy (EN only, D-32):** `dictionaries/en/shell.json` → `storage.saveStatus`, `saveError` (+ `mirrored`), `warning`, `notice`, `snapshotReason`, `import.error` (+ `moreErrors`, `migrated`, `methodologyChanged`), `fileLink.status`/`error`. Placeholders: `{time}`, `{count}`, `{max}` (MB), `{version}`, `{file}`, `{current}`. A test checks that every code has a text.

**Guards:** `lib/storage/no-network.test.ts` (no `fetch`, XHR, beacon or sockets in `lib/storage` and `lib/store`) and `lib/storage/no-html-rendering.test.ts` (no `dangerouslySetInnerHTML`/`innerHTML` in `app`, `components` and `lib` except the theme script and the shadcn chart CSS).

## How the data-safety pieces fit (D-11..D-14)

1. **Edit**: `patch` applies at once (through `applyPatch`, D-05) and schedules the autosave. Status "saving".
2. **Save** (after 400 ms): the mirror is written synchronously, then one IndexedDB transaction stores the project. The replaced state becomes a snapshot when another tab wrote it (`conflict`), or when the last snapshot is ≥ 5 min old (`autosave`). Then other tabs are told (`saved`).
3. **Leave** (close, reload, tab switch): `pagehide`/hidden flushes the pending change to the mirror synchronously and starts the IndexedDB write. The browser prompt appears only when the mirror write fails as well (memory mode, full storage).
4. **Load**: every project id from IndexedDB and the mirror is recovered (newer of record and mirror, else the newest valid snapshot) and written back; unreadable data is left untouched and counted (`unreadable` notice); a record from a newer app version is never replaced.
5. **Tabs**: a tab with the project open and no unsaved edits follows the other tab (`changed-elsewhere`). A tab with unsaved edits keeps them (`conflict`); its save keeps the other version as a snapshot (optimistic check on `updatedAt`). A delete elsewhere closes the project; unsaved edits become a `deleted-elsewhere` snapshot.
6. **Export/import**: export is the inputs only (results are derived, D-13), stamped with the current methodology version. Import checks the size first (5 MB, before reading), parses JSON, checks the envelope with Zod, runs migrations and validates; the first 20 bad fields are listed with their registry labels.
7. **Persistence**: asked once per session when there is data (start with projects, first create, import or save). Firefox shows a prompt for it.

## Deviations and documented defaults

1. **Two more stores** than the plan names: `backups` (export-reminder bookkeeping per project) and `file-links` (File System Access handles, which only IndexedDB can hold).
2. **Snapshot policy** (the plan gives only "20 rolling"): an autosave keeps the *replaced* state at most every 5 minutes, so the state before a session of edits is always kept; events keep it always (`before-restore`, `before-delete`, `before-import`, `before-migration`, `recovery`, `conflict`, `deleted-elsewhere`). All reasons share the 20 per project.
3. **Recovery** compares the IndexedDB record with the mirror and takes the newer one (by `meta.updatedAt`) before falling back to a snapshot. The plan's order (IndexedDB → mirror → snapshot) is kept for unreadable records.
4. **Unload guard**: "warns while a write is pending" is narrowed to "warns while a pending change could not be kept anywhere". The change is already in the mirror after the synchronous flush, so a prompt on every close within 400 ms would add nothing.
5. **Export format**: `{ format: "first-move/project", formatVersion: 1, exportedAt, project }`. `schemaVersion` and `methodologyVersion` live in `project.meta` (not duplicated at the top). Import also accepts a bare project (the `projectJsonSchema()` contract for the later ingestion agent, D-05).
6. **Import id clash**: default "copy" (new id, both kept); "replace" on request (the old state becomes a `before-import` snapshot). `updatedAt` is set to the import time. When the methodology version differs, `methodology.changed` says so (results are recomputed, because they are never stored).
7. **Export reminder** (team default): after 30 saved edits (debounced saves, not keystrokes), or 7 days since the first unexported edit; then a 24 h pause. Checked after each save and when a project is opened or restored on start. Linked-file writes count as exports.
8. **Delete** keeps snapshots (bounded by the 20 per project), so a delete can be undone after a reload too (`listDeleted` + `restoreSnapshot`); `undoRemove(receipt)` is the toast's undo. `purge` deletes permanently (no UI yet).
9. **Modes**: if IndexedDB is unavailable (or reading it fails), the app runs on the mirror (`mirror-only`, warning `unavailable`, no snapshots); with no storage at all it keeps projects in the tab (`memory`, save status error `unavailable`, leave prompt on).
10. **Reads**: IndexedDB is authoritative (the last write of any tab); edit times are not compared there, because a later write can carry an earlier edit time. A tab whose save failed reads its own unsaved state until a save succeeds.
11. **Store**: `zustand/vanilla` plus our own `useSyncExternalStore` hook (not Zustand's `create` hook), so the server snapshot is explicitly `INITIAL_STATE` and selectors must be stable (`selectSaveStatus` is memoized).

## Follow-ups

- **Phase 07** (shell): call `useStartProjectStore()` once in a client component of the dashboard layout; show skeletons while `phase !== "ready"`. `SaveStatus` = `selectSaveStatus` + `shell.storage.saveStatus.<kind>` (time via `formatDateTime`, client only). Toasts from `notices` (`dismissNotice`). Export = `exportProject()` + `downloadFile(file)`. Import = `importFile(file)`: on failure show `shell.storage.import.error.<code>` and the field list (`error.text` → `getDictionary(lang, text.area)` at `text.key + ".label"`, message `shell.validation.<code>` with `params`); for a clash, parse first and ask, then `adoptImport(result, { onConflict })`. Project menu: `rename`, `duplicate(id, { name })` (the copy name comes from the dictionary), `remove` → undo toast with `undoRemove(receipt)`, restore from `listSnapshots` (labels `shell.storage.snapshotReason.<reason>`), file link only when `fileLink.supported` (`linkFile`; `resumeFileLink` on a click when `needs-permission`; `unlinkFile`). Storage banner from `health.warning`. "Continue where you left off" = `lastUsedId` + its summary.
- **Phase 06**: picking an example = `getProjectStore().addCopy(localizeExample(example, lang))` (opens it; keeps `exampleId`).
- **Phase 08/10**: change inputs only through `getProjectStore().patch(patch)`; it returns the `PatchResult` at once for field errors.
- **Phase 05/09**: compute results from `active` on the client; never store them.
- **Phase 07** (How we calculate): if MathML is injected as HTML, add that file to the allow list in `no-html-rendering.test.ts` (build-time strings only).
- **Phase 11**: e2e for "close mid-edit, reload" (the `pagehide` flush), export → delete → import; DE copy for `shell.storage`; a "recently deleted" list and "delete permanently" could use `listDeleted`/`purge`; a "back up all projects" export is not built.

## What later phases must know

- Import everything from `@/lib/store` (store, hooks, state types, `selectSaveStatus`) and `@/lib/storage` (`downloadFile`, codes, limits). Never touch IndexedDB or localStorage directly, and never read them during render.
- `useProjectStore` selectors must return stable values (a state slice or a primitive); derive objects with a memoized selector.
- The store is a page-wide singleton (`getProjectStore()`); its listeners live for the page (not tied to a component), so hidden Activity routes keep saving.
- Tests: `lib/store/test-utils/harness.ts` (`testBrowser()`, `testTab(browser, options)`, `until`) gives a store over fake IndexedDB, `MemoryStorage`, a BroadcastChannel per test and manual timers (`tab.tick(ms)`); two tabs of one browser share the DB, localStorage and clock.
- `crypto.randomUUID()` (ids, tab id) needs a secure context: localhost or HTTPS.

## Next.js

No Next.js API was used: the phase is `lib/` code. `preserving-ui-state.md` (Activity runs effect cleanups for hidden routes) is why the store starts once and is never torn down by components.
