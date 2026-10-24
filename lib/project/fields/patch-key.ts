import { isIndexSegment, parsePath } from "@/lib/project/path"
import { FIELDS, getField } from "./registry"
import type { ItemsField } from "./types"

export const ITEM_LISTS = FIELDS.filter((field): field is ItemsField => field.kind === "items")

/** A path under an item list: a row (`property: null`) or one property of a row. */
export type ItemPathMatch =
  | { kind: "item"; field: ItemsField; index: number; property: string | null }
  | { kind: "read-only" }
  | { kind: "unknown-field" }

/**
 * Matches `<list>.<index>` and `<list>.<index>.<property>` against the registry's item lists.
 * Row ids are read-only. Null when the path is not under an item list. Uses no schema, so the
 * project schema itself can call it (provenance keys).
 */
export function matchItemPath(path: string, segments: readonly string[]): ItemPathMatch | null {
  for (const list of ITEM_LISTS) {
    if (!path.startsWith(`${list.id}.`)) continue
    const [index, property, ...rest] = segments.slice(list.id.split(".").length)
    if (!isIndexSegment(index) || rest.length > 0) return { kind: "unknown-field" }
    if (property === undefined) return { kind: "item", field: list, index: Number(index), property: null }
    if (list.properties.some((entry) => entry.key === property)) {
      return { kind: "item", field: list, index: Number(index), property }
    }
    return { kind: property === "id" ? "read-only" : "unknown-field" }
  }
  return null
}

/** True when `applyPatch` accepts the key: a registry field, a row of an item list or one of its properties. */
export function isPatchKey(path: string): boolean {
  const segments = parsePath(path)
  if (!segments) return false
  if (getField(path)) return true
  return matchItemPath(path, segments)?.kind === "item"
}
