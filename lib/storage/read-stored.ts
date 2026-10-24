import { migrateProject, type MigrationFailure, type Project } from "@/lib/project"

/** Why a stored copy cannot be used. */
export type StoredFailure = MigrationFailure["code"] | "id-mismatch"

export type StoredRead = { ok: true; project: Project; migrated: boolean } | { ok: false; code: StoredFailure }

/**
 * Validates a stored copy (record, mirror or snapshot): migrated to the current schema, valid,
 * and filed under its own id. Never mutates the input.
 */
export function readStored(raw: unknown, projectId: string): StoredRead {
  const result = migrateProject(raw)
  if (!result.ok) return { ok: false, code: result.error.code }
  if (result.project.meta.id !== projectId) return { ok: false, code: "id-mismatch" }
  return { ok: true, project: result.project, migrated: result.migrated }
}
