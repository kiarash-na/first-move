import { z } from "zod"
import {
  METHODOLOGY_VERSION,
  migrateProject,
  resolvePatchPath,
  type MigrateOptions,
  type MigrationResult,
  type PatchError,
  type Project,
  type TextRef,
} from "@/lib/project"
import { EXPORT_FORMAT, EXPORT_FORMAT_VERSION } from "./export"
import { IMPORT_MAX_BYTES, IMPORT_MAX_LISTED_ERRORS } from "./limits"

/** Why a file was rejected (`shell.storage.import.error.<code>`). */
export const IMPORT_ERROR_CODES = [
  "too-large",
  "empty",
  "unreadable",
  "not-json",
  "not-first-move",
  "newer-version",
  "unsupported-version",
  "invalid",
] as const

export type ImportErrorCode = (typeof IMPORT_ERROR_CODES)[number]

/** A bad field, with its label when it is a registry field (`text.key` + `.label`). */
export interface ImportFieldError extends PatchError {
  text: TextRef | null
}

export interface ImportSuccess {
  ok: true
  /** Valid, current-schema inputs. Results are recomputed from them (D-13). */
  project: Project
  /** Schema version of the file; `migrated` when it was older. */
  fromVersion: number
  migrated: boolean
  /** The file was saved with another methodology version, so results may differ from then. */
  methodology: { file: string; current: string; changed: boolean }
}

export interface ImportFailure {
  ok: false
  code: ImportErrorCode
  /** `maxMegabytes` (too-large), `version` (newer/unsupported). */
  params: { maxMegabytes?: number; version?: number }
  /** The first bad fields (invalid); `moreErrors` counts the rest. */
  errors: ImportFieldError[]
  moreErrors: number
}

export type ImportResult = ImportSuccess | ImportFailure

export interface ImportOptions {
  maxBytes?: number
  /** Injected for tests (a pretend newer schema). */
  migration?: MigrateOptions<Project>
}

const envelopeSchema = z.strictObject({
  format: z.literal(EXPORT_FORMAT),
  formatVersion: z.literal(EXPORT_FORMAT_VERSION),
  exportedAt: z.iso.datetime(),
  project: z.unknown(),
})

const fail = (code: ImportErrorCode, params: ImportFailure["params"] = {}, all: ImportFieldError[] = []): ImportFailure => ({
  ok: false,
  code,
  params,
  errors: all.slice(0, IMPORT_MAX_LISTED_ERRORS),
  moreErrors: Math.max(0, all.length - IMPORT_MAX_LISTED_ERRORS),
})

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

/** Adds the registry label to an error path, when the path is (inside) an input. */
function withLabel(error: PatchError): ImportFieldError {
  const target = resolvePatchPath(error.path)
  return { ...error, text: "field" in target ? target.field.text : null }
}

function fromEnvelope(data: Record<string, unknown>): { project: unknown } | ImportFailure {
  if (typeof data.formatVersion === "number" && data.formatVersion > EXPORT_FORMAT_VERSION) {
    return fail("newer-version", { version: data.formatVersion })
  }
  const parsed = envelopeSchema.safeParse(data)
  if (parsed.success) return { project: parsed.data.project }
  const errors = parsed.error.issues.map((issue) =>
    withLabel({ path: issue.path.map(String).join(".") || "format", code: "invalid", message: issue.message }),
  )
  return fail("invalid", {}, errors)
}

/**
 * Validates an import (D-13, D-14): a `.firstmove.json` export, or a bare project as described by
 * `projectJsonSchema()` (for the later ingestion agent). Runs migrations and lists bad fields.
 * Text is kept as typed and never interpreted; React renders it as text.
 */
export function parseImportText(text: string, { maxBytes = IMPORT_MAX_BYTES, migration }: ImportOptions = {}): ImportResult {
  if (new TextEncoder().encode(text).length > maxBytes) return fail("too-large", { maxMegabytes: maxBytes / 1024 / 1024 })
  if (text.trim() === "") return fail("empty")

  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return fail("not-json")
  }
  if (!isObject(data)) return fail("not-first-move")

  let raw: unknown
  if (data.format === EXPORT_FORMAT) {
    const unwrapped = fromEnvelope(data)
    if ("ok" in unwrapped) return unwrapped
    raw = unwrapped.project
  } else if (isObject(data.meta) && "schemaVersion" in data.meta) {
    raw = data
  } else {
    return fail("not-first-move")
  }

  let result: MigrationResult
  try {
    result = migrateProject(raw, migration)
  } catch {
    return fail("invalid")
  }
  if (!result.ok) {
    const { error } = result
    switch (error.code) {
      case "newer-version":
      case "unsupported-version":
        return fail(error.code, { version: error.version })
      case "invalid":
        return fail("invalid", { version: error.version }, error.errors.map(withLabel))
      default:
        return fail("invalid")
    }
  }

  const file = result.project.meta.methodologyVersion
  return {
    ok: true,
    project: result.project,
    fromVersion: result.fromVersion,
    migrated: result.migrated,
    methodology: { file, current: METHODOLOGY_VERSION, changed: file !== METHODOLOGY_VERSION },
  }
}

/** Reads a picked or dropped file. The size is checked before anything is read. */
export async function readImportFile(file: Blob, options: ImportOptions = {}): Promise<ImportResult> {
  const maxBytes = options.maxBytes ?? IMPORT_MAX_BYTES
  if (file.size > maxBytes) return fail("too-large", { maxMegabytes: maxBytes / 1024 / 1024 })
  if (file.size === 0) return fail("empty")
  let text: string
  try {
    text = await file.text()
  } catch {
    return fail("unreadable")
  }
  return parseImportText(text, { ...options, maxBytes })
}
