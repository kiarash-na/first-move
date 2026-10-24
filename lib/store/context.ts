import type { StoreApi } from "zustand/vanilla"
import type { Project } from "@/lib/project"
import type { FileLinkApi } from "@/lib/storage/file-link"
import type { Repository } from "@/lib/storage/repository"
import type { TabSync } from "@/lib/storage/tab-sync"
import type { FileLinkRecord } from "@/lib/storage/types"
import type { UnloadGuard } from "@/lib/storage/unload-guard"
import type { Autosave } from "./autosave"
import type { StoreDeps } from "./deps"
import type { NoticeInput } from "./notices"
import type { ProjectStoreState } from "./state"

/** What exists once `start()` has loaded storage. */
export interface Runtime {
  repo: Repository
  sync: TabSync
  guard: UnloadGuard | null
  local: Storage | null
  session: Storage | null
  /** One autosave per project with unsaved changes (the active one, or one just closed). */
  savers: Map<string, Autosave<Project>>
  /** Per project: `meta.updatedAt` this tab last read or wrote (conflict detection). */
  bases: Map<string, string | null>
  fileApi: FileLinkApi | null
  /** The active project's linked file; the handle only while permission is granted. */
  fileRecord: FileLinkRecord | null
  fileHandle: FileSystemFileHandle | null
  /** Linked-file writes, one after another. */
  fileWrites: Promise<void>
  persistRequested: boolean
  persistDenied: boolean
  savesSinceHealthCheck: number
  dispose: Array<() => void>
}

/** Shared by the action modules of the store. */
export interface StoreContext {
  deps: StoreDeps
  api: StoreApi<ProjectStoreState>
  get(): ProjectStoreState
  set(update: Partial<ProjectStoreState> | ((state: ProjectStoreState) => Partial<ProjectStoreState>)): void
  /** The runtime; actions call `ready()` first. */
  rt: Runtime | null
  /** Resolves once storage is loaded (starts it if needed). */
  ready(): Promise<Runtime>
  notify(input: NoticeInput): void
}
