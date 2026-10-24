import type { Project } from "@/lib/project"
import type { MirrorEntry } from "./mirror"
import { readStored, type StoredFailure } from "./read-stored"

/** Where a loaded project came from. */
export type RecoverySource = "indexeddb" | "mirror" | "snapshot"

export interface RecoveredProject {
  project: Project
  from: RecoverySource
  /** The project must be written back to IndexedDB: it came from a backup or was migrated. */
  writeBack: boolean
  /** The stored record was of an older schema (kept as a "before-migration" snapshot). */
  migrated: boolean
}

export interface UnreadableProject {
  id: string
  code: StoredFailure
}

export interface RecoveryReport {
  projects: RecoveredProject[]
  /** Stored data that could not be used. It is left untouched (never overwritten). */
  unreadable: UnreadableProject[]
}

export interface RecoverySources {
  /** IndexedDB records by id (empty when IndexedDB is unavailable). */
  records: ReadonlyMap<string, unknown>
  mirrors: ReadonlyMap<string, MirrorEntry>
  /** Snapshots of a project, newest first (raw JSON). */
  snapshots(projectId: string): Promise<readonly unknown[]>
}

const newer = (a: Project, b: Project) => a.meta.updatedAt.localeCompare(b.meta.updatedAt) > 0

async function recoverOne(id: string, sources: RecoverySources): Promise<RecoveredProject | UnreadableProject> {
  const record = sources.records.has(id) ? readStored(sources.records.get(id), id) : null
  const mirrorEntry = sources.mirrors.get(id)
  const mirror = mirrorEntry ? readStored(mirrorEntry.project, id) : null

  // A record written by a newer version of the app is never replaced by an older copy.
  if (record && !record.ok && record.code === "newer-version") return { id, code: record.code }

  if (record?.ok) {
    if (mirror?.ok && newer(mirror.project, record.project)) {
      return { project: mirror.project, from: "mirror", writeBack: true, migrated: false }
    }
    return { project: record.project, from: "indexeddb", writeBack: record.migrated, migrated: record.migrated }
  }
  if (mirror?.ok) return { project: mirror.project, from: "mirror", writeBack: true, migrated: false }

  if (record && !record.ok) {
    for (const raw of await sources.snapshots(id)) {
      const snapshot = readStored(raw, id)
      if (snapshot.ok) return { project: snapshot.project, from: "snapshot", writeBack: true, migrated: false }
    }
    return { id, code: record.code }
  }
  return { id, code: mirror && !mirror.ok ? mirror.code : "invalid" }
}

/**
 * Loads every project on start (PLAN-DASH-04): the IndexedDB record, unless the mirror is newer
 * or the record is unreadable; then the newest valid snapshot. Nothing is written here; the
 * caller writes back what `writeBack` marks.
 */
export async function recoverProjects(sources: RecoverySources): Promise<RecoveryReport> {
  const ids = new Set([...sources.records.keys(), ...sources.mirrors.keys()])
  const report: RecoveryReport = { projects: [], unreadable: [] }
  for (const id of ids) {
    const result = await recoverOne(id, sources)
    if ("project" in result) report.projects.push(result)
    else report.unreadable.push(result)
  }
  return report
}
