import type { z } from "zod"
import { toPatchErrors, type PatchError } from "@/lib/project/patch-errors"
import { projectSchema, type Project } from "@/lib/project/schema/project"
import { SCHEMA_VERSION } from "@/lib/project/versions"
import { MIGRATIONS } from "./chain"
import type { JsonObject, Migration } from "./types"

export type MigrationFailure =
  /** Not a plain JSON object. */
  | { code: "not-object" }
  | { code: "missing-version" }
  /** Saved by a newer version of the app. */
  | { code: "newer-version"; version: number }
  /** Older than the baseline, or a step of the chain is missing. */
  | { code: "unsupported-version"; version: number }
  /** Migrated, but not a valid project. */
  | { code: "invalid"; version: number; errors: PatchError[] }

export type MigrationResult<T = Project> =
  | { ok: true; project: T; fromVersion: number; migrated: boolean }
  | { ok: false; error: MigrationFailure }

export interface MigrateOptions<T> {
  migrations?: readonly Migration[]
  schema?: z.ZodType<T>
  target?: number
}

const isObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value)

/**
 * Brings stored or imported data up to the current schema and validates it (D-13). Runs every
 * step after the data's `meta.schemaVersion`, in order, then parses with the project schema.
 * The input is never mutated.
 */
export function migrateProject<T = Project>(input: unknown, options: MigrateOptions<T> = {}): MigrationResult<T> {
  const {
    migrations = MIGRATIONS,
    schema = projectSchema as unknown as z.ZodType<T>,
    target = SCHEMA_VERSION,
  } = options
  if (!isObject(input)) return { ok: false, error: { code: "not-object" } }
  const version = isObject(input.meta) ? input.meta.schemaVersion : undefined
  if (typeof version !== "number" || !Number.isInteger(version)) return { ok: false, error: { code: "missing-version" } }
  if (version > target) return { ok: false, error: { code: "newer-version", version } }
  if (migrations.length === 0 || version < migrations[0].version) {
    return { ok: false, error: { code: "unsupported-version", version } }
  }

  let data: JsonObject
  try {
    data = structuredClone(input)
  } catch {
    return { ok: false, error: { code: "not-object" } }
  }
  for (let next = version + 1; next <= target; next++) {
    const step = migrations.find((migration) => migration.version === next)
    if (!step) return { ok: false, error: { code: "unsupported-version", version } }
    data = step.up(data)
    data = { ...data, meta: { ...(data.meta as JsonObject), schemaVersion: next } }
  }

  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    return { ok: false, error: { code: "invalid", version, errors: toPatchErrors([], data, parsed.error.issues) } }
  }
  return { ok: true, project: parsed.data, fromVersion: version, migrated: version !== target }
}
