import type { Project } from "@/lib/project"
import { readBackup, updateBackup } from "./backups"
import { deleteProjectRecord } from "./delete-project"
import { withCurrentMethodology } from "./export"
import { fileLinkRecords, type FileLinkRecords } from "./file-link-records"
import { readProjectRecord, readProjectRecords, updatedAtOf, type StorageDb } from "./idb"
import { readAllMirrors, readMirror, removeMirror, writeMirror } from "./mirror"
import { readStored } from "./read-stored"
import { recoverProjects, type RecoveryReport } from "./recovery"
import { emptyBackup } from "./reminder"
import { saveErrorCode, type SaveErrorCode } from "./save-error"
import { saveProjectRecord } from "./save-project"
import { addSnapshot, deleteSnapshots, getSnapshot, listDeletedProjects, listSnapshots, readSnapshots } from "./snapshots"
import type { BackupState, SnapshotInfo, SnapshotReason, SnapshotRecord, StorageMode } from "./types"

export interface SaveOptions {
  /** `meta.updatedAt` this tab last read or wrote for the project (null for a new one). */
  base: string | null
  countsAsEdit?: boolean
  snapshotReason?: SnapshotReason
}

export type SaveOutcome =
  | {
      ok: true
      /** The localStorage copy was written too. */
      mirrored: boolean
      conflict: boolean
      snapshot: SnapshotReason | null
      backup: BackupState | null
    }
  | { ok: false; error: SaveErrorCode; mirrored: boolean }

/**
 * Everything the store needs from the browser's storage, in one place (PLAN-DASH-04 step 1):
 * IndexedDB first, the localStorage mirror always, so either one alone can bring a project back.
 */
export interface Repository {
  readonly mode: StorageMode
  /** Loads and recovers every project; writes back what came from a backup copy. */
  loadAll(): Promise<RecoveryReport>
  /** One project: this tab's unsaved state, else IndexedDB (the last write of any tab), else the mirror. */
  read(projectId: string): Promise<Project | null>
  /** Mirror first (synchronous), then IndexedDB in one transaction. */
  save(project: Project, options: SaveOptions): Promise<SaveOutcome>
  /** The synchronous part of a save, for page unload. True when written. */
  mirror(project: Project): boolean
  /** Deletes a project; its last state stays as a snapshot. Returns the snapshot id. */
  remove(projectId: string, latest: Project | null): Promise<number | null>
  /** Removes a project and all its snapshots (permanent). */
  purge(projectId: string): Promise<void>
  addSnapshot(projectId: string, project: Project, reason: SnapshotReason): Promise<number | null>
  listSnapshots(projectId: string): Promise<SnapshotInfo[]>
  getSnapshot(snapshotId: number): Promise<SnapshotRecord | null>
  listDeleted(): Promise<SnapshotInfo[]>
  readBackup(projectId: string): Promise<BackupState>
  updateBackup(projectId: string, change: (state: BackupState) => BackupState): Promise<BackupState>
  readonly fileLinks: FileLinkRecords
  close(): void
}

export interface RepositoryOptions {
  db: StorageDb | null
  /** localStorage, if writable. */
  local: Storage | null
  now(): Date
}

export function createRepository({ db, local, now }: RepositoryOptions): Repository {
  const mode: StorageMode = db ? "indexeddb" : local ? "mirror-only" : "memory"
  /**
   * Projects whose last save in this tab did not reach the primary store, with that state: they
   * are read from here until a save succeeds, so the tab never goes back to an older copy.
   */
  const unsaved = new Map<string, Project>()

  async function writeBack(report: RecoveryReport, mirrorAt: Map<string, string | null>) {
    for (const item of report.projects) {
      const { project } = item
      if (item.writeBack && db) {
        try {
          const snapshotReason = item.migrated ? "before-migration" : "recovery"
          await saveProjectRecord(db, project, { base: null, now: now(), snapshotReason })
        } catch {
          // Still loaded from the copy; the next save tries again.
        }
      }
      if (mirrorAt.get(project.meta.id) !== project.meta.updatedAt) writeMirror(local, project, now())
    }
  }

  return {
    mode,

    async loadAll() {
      const records = db ? await readProjectRecords(db) : new Map<string, unknown>()
      const mirrors = readAllMirrors(local)
      const report = await recoverProjects({
        records,
        mirrors,
        snapshots: async (projectId) => (db ? (await readSnapshots(db, projectId)).map((record) => record.project) : []),
      })
      const mirrorAt = new Map([...mirrors].map(([id, entry]) => [id, updatedAtOf(entry.project)]))
      await writeBack(report, mirrorAt)
      return report
    },

    async read(projectId) {
      const pending = unsaved.get(projectId)
      if (pending) return pending
      // IndexedDB holds the last write of any tab; the mirror is the fallback.
      if (db) {
        try {
          const record = readStored(await readProjectRecord(db, projectId), projectId)
          if (record.ok) return record.project
        } catch {
          // Fall through to the mirror.
        }
      }
      const entry = readMirror(local, projectId)
      const mirrored = entry ? readStored(entry.project, projectId) : null
      return mirrored?.ok ? mirrored.project : null
    },

    async save(project, { base, countsAsEdit = false, snapshotReason }) {
      const stamped = withCurrentMethodology(project)
      const id = stamped.meta.id
      const at = now()
      const mirrorResult = writeMirror(local, stamped, at)
      const mirrored = mirrorResult === "ok"
      let outcome: SaveOutcome
      if (!db) {
        outcome = mirrored
          ? { ok: true, mirrored, conflict: false, snapshot: null, backup: null }
          : { ok: false, error: mirrorResult === "quota-exceeded" ? "quota-exceeded" : "unavailable", mirrored }
      } else {
        try {
          outcome = { ok: true, mirrored, ...(await saveProjectRecord(db, stamped, { base, now: at, countsAsEdit, snapshotReason })) }
        } catch (error) {
          outcome = { ok: false, error: saveErrorCode(error), mirrored }
        }
      }
      if (outcome.ok) unsaved.delete(id)
      else unsaved.set(id, stamped)
      return outcome
    },

    mirror(project) {
      return writeMirror(local, withCurrentMethodology(project), now()) === "ok"
    },

    async remove(projectId, latest) {
      // Mirror first: if the tab dies in between, the project survives in IndexedDB (no loss).
      unsaved.delete(projectId)
      removeMirror(local, projectId)
      return db ? deleteProjectRecord(db, projectId, latest, now()) : null
    },

    async purge(projectId) {
      unsaved.delete(projectId)
      removeMirror(local, projectId)
      if (!db) return
      await deleteProjectRecord(db, projectId, null, now())
      await deleteSnapshots(db, projectId)
    },

    async addSnapshot(projectId, project, reason) {
      return db ? addSnapshot(db, { projectId, takenAt: now().toISOString(), reason, project }) : null
    },

    async listSnapshots(projectId) {
      return db ? listSnapshots(db, projectId) : []
    },

    async getSnapshot(snapshotId) {
      return db ? ((await getSnapshot(db, snapshotId)) ?? null) : null
    },

    async listDeleted() {
      return db ? listDeletedProjects(db) : []
    },

    async readBackup(projectId) {
      return db ? readBackup(db, projectId) : emptyBackup(projectId)
    },

    async updateBackup(projectId, change) {
      return db ? updateBackup(db, projectId, change) : change(emptyBackup(projectId))
    },

    fileLinks: fileLinkRecords(db),

    close() {
      db?.close()
    },
  }
}
