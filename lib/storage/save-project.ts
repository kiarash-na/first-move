import type { Project } from "@/lib/project"
import { updatedAtOf, type StorageDb } from "./idb"
import { STORE } from "./keys"
import { MAX_SNAPSHOTS, SNAPSHOT_INTERVAL_MS } from "./limits"
import { emptyBackup, recordEdit } from "./reminder"
import { addSnapshotTo, isSnapshotDue, newestSnapshotIn } from "./snapshots"
import type { BackupState, SnapshotReason } from "./types"

export interface SaveRecordOptions {
  /**
   * `meta.updatedAt` of the version this tab last read or wrote (null for a new project). When
   * the stored version differs, another tab wrote it: it is kept as a "conflict" snapshot.
   */
  base: string | null
  now: Date
  /** A user edit: counts toward the export reminder. */
  countsAsEdit?: boolean
  /** Keep the stored version as a snapshot with this reason (restore, import, recovery). */
  snapshotReason?: SnapshotReason
  intervalMs?: number
  maxSnapshots?: number
}

export interface SaveRecordResult {
  /** The stored version was written by someone else (kept as a snapshot). */
  conflict: boolean
  /** The reason of the snapshot taken of the replaced version, if any. */
  snapshot: SnapshotReason | null
  /** Bookkeeping after this save, when it counted as an edit. */
  backup: BackupState | null
}

/**
 * Writes a project in one transaction (atomic): the replaced version becomes a snapshot when an
 * event asks for it, when another tab wrote it, or when the last snapshot is older than the
 * interval; snapshots are rotated; the edit is counted for the export reminder.
 */
export async function saveProjectRecord(
  db: StorageDb,
  project: Project,
  { base, now, countsAsEdit = false, snapshotReason, intervalMs = SNAPSHOT_INTERVAL_MS, maxSnapshots = MAX_SNAPSHOTS }: SaveRecordOptions,
): Promise<SaveRecordResult> {
  const id = project.meta.id
  const tx = db.transaction([STORE.projects, STORE.snapshots, STORE.backups], "readwrite")
  const done = tx.done
  done.catch(() => undefined)

  const projects = tx.objectStore(STORE.projects)
  const snapshots = tx.objectStore(STORE.snapshots)
  const stored = await projects.get(id)
  const storedAt = updatedAtOf(stored)

  let reason: SnapshotReason | null = null
  if (stored !== undefined) {
    // An event (restore, import, recovery) always keeps what it replaces; an autosave only keeps
    // a different version: another tab's (conflict), or an older one when a snapshot is due.
    if (snapshotReason) reason = snapshotReason
    else if (storedAt === project.meta.updatedAt) reason = null
    else if (base !== storedAt) reason = "conflict"
    else if (isSnapshotDue(await newestSnapshotIn(snapshots, id), now, intervalMs)) reason = "autosave"
  }
  if (reason) {
    await addSnapshotTo(snapshots, { projectId: id, takenAt: now.toISOString(), reason, project: stored }, maxSnapshots)
  }
  await projects.put(project, id)

  let backup: BackupState | null = null
  if (countsAsEdit) {
    const backups = tx.objectStore(STORE.backups)
    backup = recordEdit((await backups.get(id)) ?? emptyBackup(id), now)
    await backups.put(backup)
  }
  await done
  return { conflict: reason === "conflict", snapshot: reason, backup }
}
