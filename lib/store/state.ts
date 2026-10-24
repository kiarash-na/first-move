import type { Project, ProjectModules } from "@/lib/project"
import type { FileLinkErrorCode } from "@/lib/storage/file-link"
import { UNKNOWN_HEALTH, type StorageHealth } from "@/lib/storage/persist"
import type { SaveErrorCode } from "@/lib/storage/save-error"
import type { StorageMode } from "@/lib/storage/types"

/** What the project list and "Continue where you left off" show (D-03). */
export interface ProjectSummary {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  modules: ProjectModules
  exampleId: string | null
}

/** idle: not started (also the server snapshot) · loading: reading storage · ready. */
export type StorePhase = "idle" | "loading" | "ready"

export type SaveState = "idle" | "saving" | "saved" | "error"

/** Autosave of the active project (D-08). */
export interface SaveInfo {
  state: SaveState
  /** Last successful save (or the project's last change when it was opened). */
  savedAt: string | null
  error: SaveErrorCode | null
  /** On error: the localStorage copy was still written, so the change is kept in this browser. */
  mirrored: boolean
}

/** Toasts and banners the shell shows (`shell.storage.notice.<kind>`). */
export const NOTICE_KINDS = [
  /** Another tab saved the open project; this tab now shows that version. */
  "changed-elsewhere",
  /** Both tabs changed it; this tab's version is kept, the other one is a snapshot. */
  "conflict",
  /** Another tab deleted the open project (unsaved edits are kept as a snapshot). */
  "deleted-elsewhere",
  "export-reminder",
  /** Projects were brought back from the mirror or a snapshot on load (`count`). */
  "recovered",
  /** Stored projects could not be read and were left untouched (`count`). */
  "unreadable",
  /** A newer version of the app opened in another tab; reload to keep saving. */
  "reload-required",
] as const

export type NoticeKind = (typeof NOTICE_KINDS)[number]

export interface StorageNotice {
  id: number
  kind: NoticeKind
  projectId: string | null
  count: number | null
}

/** off · on (each save also writes the file) · needs-permission (after a reload: one click) · error. */
export type FileLinkStatus = "off" | "on" | "needs-permission" | "error"

/** "Link to a file" for the active project (D-12). `supported` is false on the server and outside Chromium. */
export interface FileLinkInfo {
  supported: boolean
  status: FileLinkStatus
  fileName: string | null
  error: FileLinkErrorCode | null
}

export interface ProjectStoreState {
  phase: StorePhase
  /** Where data is kept; null until loaded. */
  mode: StorageMode | null
  /** All projects, most recently changed first. */
  projects: readonly ProjectSummary[]
  /** The project open in this tab (sessionStorage; last-used as fallback). Never in the URL. */
  activeId: string | null
  active: Project | null
  /** Last project used in any tab ("Continue where you left off"). */
  lastUsedId: string | null
  save: SaveInfo
  health: StorageHealth
  notices: readonly StorageNotice[]
  fileLink: FileLinkInfo
}

/** Before loading, and always on the server: no data (PLAN-DASH-04 step 4). */
export const INITIAL_STATE: ProjectStoreState = Object.freeze({
  phase: "idle",
  mode: null,
  projects: Object.freeze([]) as readonly ProjectSummary[],
  activeId: null,
  active: null,
  lastUsedId: null,
  save: Object.freeze({ state: "idle", savedAt: null, error: null, mirrored: false }) as SaveInfo,
  health: UNKNOWN_HEALTH,
  notices: Object.freeze([]) as readonly StorageNotice[],
  fileLink: Object.freeze({ supported: false, status: "off", fileName: null, error: null }) as FileLinkInfo,
}) as ProjectStoreState
