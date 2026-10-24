/**
 * The project store (PLAN-DASH-04 step 3–4): projects list, active project, autosave and save
 * status, notices, snapshots, export/import and the file link. Client components read it with
 * `useProjectStore(selector)` and change it through `getProjectStore()` actions.
 */
export type { AddOptions, CreateOptions } from "./actions/projects"
export type { DeleteReceipt } from "./actions/remove"
export type { RestoreErrorCode, RestoreResult } from "./actions/snapshots"
export type { ImportConflict, ImportFileOptions, ImportOutcome } from "./actions/transfer"
export { createProjectStore, type ProjectStore } from "./create-project-store"
export { browserDeps, type StoreDeps } from "./deps"
export { getProjectStore } from "./project-store"
export { SAVE_STATUS_KINDS, selectSaveStatus, type SaveStatus } from "./save-status"
export * from "./state"
export { useProjectStore, useStartProjectStore } from "./use-project-store"
