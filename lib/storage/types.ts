/** Records kept in IndexedDB besides the projects themselves (PLAN-DASH-04). */

/** Why a snapshot was taken; shown in the restore list (`shell.storage.snapshotReason.<reason>`). */
export const SNAPSHOT_REASONS = [
  /** The state before an autosave, at most every `SNAPSHOT_INTERVAL_MS`. */
  "autosave",
  /** Another tab saved a version this tab did not know; kept before this tab's save replaced it. */
  "conflict",
  "before-restore",
  "before-delete",
  "before-import",
  /** A stored project of an older schema, kept before the migrated version replaced it. */
  "before-migration",
  /** Unsaved edits of this tab when another tab deleted the project. */
  "deleted-elsewhere",
  /** The stored state when a newer copy (mirror or snapshot) replaced it on load. */
  "recovery",
] as const

export type SnapshotReason = (typeof SNAPSHOT_REASONS)[number]

/** One older state of a project. */
export interface SnapshotRecord {
  /** Auto-increment key; set by IndexedDB. Higher is newer. */
  id?: number
  projectId: string
  /** ISO 8601 time the snapshot was taken. */
  takenAt: string
  reason: SnapshotReason
  /** The project as it was: raw JSON, possibly an older schema version (migrated on restore). */
  project: unknown
}

/** A snapshot without its data, for lists. */
export interface SnapshotInfo {
  id: number
  projectId: string
  takenAt: string
  reason: SnapshotReason
  /** Project name and last change of the kept state, when readable. */
  name: string | null
  updatedAt: string | null
}

/** Export bookkeeping of one project (export reminder, D-11). */
export interface BackupState {
  projectId: string
  /** Last export or linked-file write. */
  exportedAt: string | null
  /** Saved edits since then. */
  editsSinceExport: number
  /** First edit after the last export. */
  pendingSince: string | null
  /** Last time the reminder was shown. */
  remindedAt: string | null
}

/** A linked file for autosave (File System Access, D-12). The handle is structured-cloneable. */
export interface FileLinkRecord {
  projectId: string
  handle: FileSystemFileHandle
  fileName: string
  linkedAt: string
}

/** Where the projects of this browser are kept. */
export type StorageMode =
  /** IndexedDB with the localStorage mirror (normal). */
  | "indexeddb"
  /** IndexedDB is unavailable; only the localStorage mirror holds data. */
  | "mirror-only"
  /** Neither is available: data lives in this tab only. */
  | "memory"
