/**
 * Dot paths into a project (`buildings.shares.residential.1991_2010`, `businessPlan.risks.0.title`).
 * Field ids in the registry are dot paths; a numeric segment is an index into a list.
 */

const SEGMENT = /^[A-Za-z0-9_-]+$/
const FORBIDDEN = new Set(["__proto__", "prototype", "constructor"])
const INDEX = /^(0|[1-9]\d*)$/

/** Splits a dot path into segments, or returns null if any segment is empty or unsafe. */
export function parsePath(path: string): string[] | null {
  const segments = path.split(".")
  return segments.every((segment) => SEGMENT.test(segment) && !FORBIDDEN.has(segment)) ? segments : null
}

export function joinPath(segments: readonly PropertyKey[]): string {
  return segments.map(String).join(".")
}

/** A canonical list index: `0`, `1`, `12` (no sign, no leading zero). */
export function isIndexSegment(segment: string): boolean {
  return INDEX.test(segment)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** True when every segment exists as an own key (or list index) along the path. */
export function hasPath(root: unknown, segments: readonly string[]): boolean {
  let node = root
  for (const segment of segments) {
    if (Array.isArray(node)) {
      if (!isIndexSegment(segment) || Number(segment) >= node.length) return false
      node = node[Number(segment)]
    } else if (isRecord(node) && Object.hasOwn(node, segment)) {
      node = node[segment]
    } else {
      return false
    }
  }
  return true
}

/** The value at a path, or undefined when the path does not exist. */
export function getAt(root: unknown, segments: readonly string[]): unknown {
  if (!hasPath(root, segments)) return undefined
  let node = root
  for (const segment of segments) node = (node as Record<string, unknown>)[segment]
  return node
}

/**
 * Returns a copy of `root` with `value` at the path. Only the containers along the path are
 * copied; everything else is shared. The path must exist (check with `hasPath`).
 */
export function setAt<T>(root: T, segments: readonly string[], value: unknown): T {
  if (segments.length === 0) return value as T
  if (!hasPath(root, segments)) throw new Error(`Path does not exist: ${joinPath(segments)}`)
  const [head, ...rest] = segments
  if (Array.isArray(root)) {
    const copy = [...root]
    copy[Number(head)] = setAt(copy[Number(head)], rest, value)
    return copy as T
  }
  const record = root as Record<string, unknown>
  return { ...record, [head]: setAt(record[head], rest, value) } as T
}
