import { resolvePatchPath } from "./fields/resolve"
import { getAt, hasPath, setAt } from "./path"
import { toPatchErrors, type PatchError } from "./patch-errors"
import { projectSchema, type Project } from "./schema/project"
import { schemaAt } from "./schema/schema-at"

/**
 * A patch: registry field ids (dot paths) → new values. `null` clears a nullable input. Item
 * lists take the whole list (add, remove, reorder) or `<list>.<index>[.<property>]`.
 */
export type ProjectPatch = Readonly<Record<string, unknown>>

export interface ApplyPatchOptions {
  /** Apply nothing if any key fails. Default: apply the valid keys, report the others. */
  atomic?: boolean
  /** Stamped into `meta.updatedAt` when the patch changes something. Defaults to now. */
  now?: Date
}

export interface PatchResult {
  /** True when every key was applied. */
  ok: boolean
  /** The patched project; the same object when nothing changed. */
  project: Project
  /** Keys that were applied, in patch order. */
  applied: string[]
  /** Per-field errors (codes for the UI, detail for agents). */
  errors: PatchError[]
}

interface Entry {
  key: string
  segments: string[]
  value: unknown
  /** A whole-row patch (`<list>.<index>`): the row keeps its id. */
  row?: boolean
}

const idOf = (row: unknown) => (typeof row === "object" && row !== null ? (row as { id?: unknown }).id : undefined)

/**
 * Applies entries in order; a row that no longer exists (index out of range) is "not-found". A
 * whole-row patch may not change the row's id (read-only, like `<list>.<index>.id`); a whole-list
 * patch sets the ids, because it adds, removes and reorders rows.
 */
function build(project: Project, entries: readonly Entry[]) {
  let next = project
  const applied: Entry[] = []
  const errors: PatchError[] = []
  for (const entry of entries) {
    if (!hasPath(next, entry.segments)) {
      errors.push({ path: entry.key, code: "not-found", message: `No row at ${entry.key}` })
      continue
    }
    if (entry.row && idOf(entry.value) !== idOf(getAt(next, entry.segments))) {
      errors.push({ path: `${entry.key}.id`, code: "read-only", message: `${entry.key}.id is managed by the app` })
      continue
    }
    next = setAt(next, entry.segments, entry.value)
    applied.push(entry)
  }
  return { next, applied, errors }
}

const overlaps = (a: readonly string[], b: readonly string[]) => {
  const length = Math.min(a.length, b.length)
  return a.slice(0, length).every((segment, index) => segment === b[index])
}

/**
 * Validates a patch through the project schema and applies it (D-05). Every key is checked on
 * its own (type, range, choice, length); then the whole project is checked, so rules across
 * fields (at least one module) reject the keys that broke them. `project` must be valid
 * (from `createProject` or `migrateProject`).
 */
export function applyPatch(project: Project, patch: ProjectPatch, options: ApplyPatchOptions = {}): PatchResult {
  const errors: PatchError[] = []
  const valid: Entry[] = []

  for (const [key, value] of Object.entries(patch)) {
    const target = resolvePatchPath(key)
    if (target.kind === "unknown-field" || target.kind === "read-only") {
      const message = target.kind === "read-only" ? `${key} is managed by the app` : `${key} is not a field`
      errors.push({ path: key, code: target.kind, message })
      continue
    }
    const parsed = schemaAt(projectSchema, target.segments)!.safeParse(value)
    const row = target.kind === "item" && target.property === null
    if (parsed.success) valid.push({ key, segments: target.segments, value: parsed.data, row })
    else errors.push(...toPatchErrors(target.segments, value, parsed.error.issues))
  }

  const unchanged = (extra: PatchError[]): PatchResult => ({ ok: false, project, applied: [], errors: [...errors, ...extra] })
  if (options.atomic && errors.length > 0) return unchanged([])

  let attempt = build(project, valid)
  const check = projectSchema.safeParse(attempt.next)
  if (!check.success) {
    const blamed: PatchError[] = []
    for (const issue of check.error.issues) {
      const issuePath = issue.path.map(String)
      for (const entry of attempt.applied.filter((candidate) => overlaps(candidate.segments, issuePath))) {
        if (blamed.some((error) => error.path === entry.key)) continue
        const [error] = toPatchErrors([], attempt.next, [issue])
        blamed.push({ ...error, path: entry.key })
      }
    }
    if (options.atomic) return unchanged(blamed)
    attempt = build(
      project,
      valid.filter((entry) => !blamed.some((error) => error.path === entry.key)),
    )
    errors.push(...blamed)
    const recheck = projectSchema.safeParse(attempt.next)
    if (!recheck.success) return unchanged(toPatchErrors([], attempt.next, recheck.error.issues))
  }

  errors.push(...attempt.errors)
  if (options.atomic && errors.length > 0) return unchanged([])

  const changed = JSON.stringify(attempt.next) !== JSON.stringify(project)
  const next = changed ? setAt(attempt.next, ["meta", "updatedAt"], (options.now ?? new Date()).toISOString()) : project
  return {
    ok: errors.length === 0,
    project: next,
    applied: attempt.applied.map((entry) => entry.key),
    errors,
  }
}
