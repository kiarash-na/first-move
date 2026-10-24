import { createStore, type StoreApi } from "zustand/vanilla"
import type { PatchResult, Project, ProjectPatch } from "@/lib/project"
import type { ExportFile } from "@/lib/storage/export"
import type { ImportSuccess } from "@/lib/storage/import"
import type { SnapshotInfo } from "@/lib/storage/types"
import { refreshHealth } from "./actions/health"
import { closeProject, flushAll, openProject, patchActive, patchProject } from "./actions/editing"
import { linkFile, resumeFileLink, unlinkFile } from "./actions/file-link"
import { runStart, runStop } from "./actions/lifecycle"
import { addCopy, create, duplicate, type AddOptions, type CreateOptions } from "./actions/projects"
import { purgeProject, removeProject, undoRemove, type DeleteReceipt } from "./actions/remove"
import { listDeleted, listSnapshots, restoreSnapshot, type RestoreResult } from "./actions/snapshots"
import { adoptImport, exportProject, importFile, type ImportFileOptions, type ImportOutcome } from "./actions/transfer"
import type { Runtime, StoreContext } from "./context"
import type { StoreDeps } from "./deps"
import { addNotice, removeNotice } from "./notices"
import { INITIAL_STATE, type ProjectStoreState } from "./state"

/**
 * The project store (PLAN-DASH-04 step 3): state for the UI plus every action that changes
 * projects. All visible state is in `getState()`; actions are stable functions.
 */
export interface ProjectStore {
  getState(): ProjectStoreState
  /** The empty state, also used as the server snapshot. */
  getInitialState(): ProjectStoreState
  subscribe(listener: () => void): () => void

  /** Loads storage once; later calls return the same promise. Call from an effect. */
  start(): Promise<void>
  /** Tests only: tears everything down and resets the state. */
  stop(): void

  create(options: CreateOptions): Promise<Project>
  /** Adds a copy of a given project (examples, D-04). */
  addCopy(project: Project, options?: { name?: string } & AddOptions): Promise<Project>
  duplicate(id: string, options?: { name?: string } & AddOptions): Promise<Project | null>
  open(id: string): Promise<boolean>
  close(): Promise<void>
  /** Edits the open project (the only way inputs change, with `patchProject`). */
  patch(patch: ProjectPatch): PatchResult | null
  /** Edits any project, e.g. a rename or module switch from the project list. */
  patchProject(id: string, patch: ProjectPatch): Promise<PatchResult | null>
  rename(id: string, name: string): Promise<PatchResult | null>
  remove(id: string): Promise<DeleteReceipt | null>
  undoRemove(receipt: DeleteReceipt): Promise<Project>
  purge(id: string): Promise<void>

  listSnapshots(projectId: string): Promise<SnapshotInfo[]>
  listDeleted(): Promise<SnapshotInfo[]>
  restoreSnapshot(snapshotId: number): Promise<RestoreResult>

  exportProject(id?: string): Promise<ExportFile | null>
  importFile(file: Blob, options?: ImportFileOptions): Promise<ImportOutcome>
  /** Adds an already validated import (e.g. after asking copy or replace). */
  adoptImport(result: ImportSuccess, options?: ImportFileOptions): Promise<ImportOutcome>

  /** Stores pending edits now. */
  flush(): Promise<boolean>
  dismissNotice(id: number): void
  refreshHealth(): Promise<void>

  /** "Link to a file" (D-12); call these from clicks. */
  linkFile(): Promise<boolean>
  resumeFileLink(): Promise<boolean>
  unlinkFile(): Promise<void>
}

export function createProjectStore(deps: StoreDeps): ProjectStore {
  const api: StoreApi<ProjectStoreState> = createStore<ProjectStoreState>()(() => INITIAL_STATE)
  let starting: Promise<Runtime> | null = null
  let noticeId = 0

  const ctx: StoreContext = {
    deps,
    api,
    get: api.getState,
    set: (update) => api.setState(update),
    rt: null,
    ready: () => (starting ??= runStart(ctx)),
    notify: (input) => api.setState((state) => ({ notices: addNotice(state.notices, input, ++noticeId) })),
  }

  return {
    getState: api.getState,
    getInitialState: api.getInitialState,
    subscribe: (listener) => api.subscribe(() => listener()),

    start: async () => {
      await ctx.ready()
    },
    stop: () => {
      runStop(ctx)
      starting = null
    },

    create: (options) => create(ctx, options),
    addCopy: (project, options) => addCopy(ctx, project, options),
    duplicate: (id, options) => duplicate(ctx, id, options),
    open: (id) => openProject(ctx, id),
    close: () => closeProject(ctx),
    patch: (patch) => patchActive(ctx, patch),
    patchProject: (id, patch) => patchProject(ctx, id, patch),
    rename: (id, name) => patchProject(ctx, id, { "meta.name": name }),
    remove: (id) => removeProject(ctx, id),
    undoRemove: (receipt) => undoRemove(ctx, receipt),
    purge: (id) => purgeProject(ctx, id),

    listSnapshots: (projectId) => listSnapshots(ctx, projectId),
    listDeleted: () => listDeleted(ctx),
    restoreSnapshot: (snapshotId) => restoreSnapshot(ctx, snapshotId),

    exportProject: (id) => exportProject(ctx, id),
    importFile: (file, options) => importFile(ctx, file, options),
    adoptImport: (result, options) => adoptImport(ctx, result, options),

    flush: async () => (ctx.rt ? flushAll(ctx.rt) : true),
    dismissNotice: (id) => api.setState((state) => ({ notices: removeNotice(state.notices, id) })),
    refreshHealth: () => refreshHealth(ctx),

    linkFile: () => linkFile(ctx),
    resumeFileLink: () => resumeFileLink(ctx),
    unlinkFile: () => unlinkFile(ctx),
  }
}
