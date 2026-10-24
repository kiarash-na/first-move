import type { AiMark } from "./schema/provenance"

/** What an applied patch key wrote: one value, one row of an item list, or a whole list. */
export interface WrittenValue {
  key: string
  value: unknown
  shape: "value" | "row" | "list"
  /** Patchable properties of the rows (row and list shapes). */
  properties?: readonly string[]
}

const isEmpty = (value: unknown) => value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)

const propertyOf = (row: unknown, property: string) =>
  typeof row === "object" && row !== null ? (row as Record<string, unknown>)[property] : undefined

/**
 * The single values a write sets, as patch keys: the key itself, or each property of a row (or
 * of every row of a list). Empty values are not marked: an empty field has no AI value to show.
 */
export function writtenLeaves({ key, value, shape, properties = [] }: WrittenValue): string[] {
  if (shape === "value") return isEmpty(value) ? [] : [key]
  const rows = shape === "row" ? [[key, value] as const] : (Array.isArray(value) ? value : []).map((row, index) => [`${key}.${index}`, row] as const)
  return rows.flatMap(([rowKey, row]) =>
    properties.filter((property) => !isEmpty(propertyOf(row, property))).map((property) => `${rowKey}.${property}`),
  )
}

/**
 * Updates the AI marks after a patch. Every applied key first drops the marks at or below it
 * (a replaced list drops the marks of all its rows); with `mark`, the values it wrote are marked
 * as AI-proposed. Without `mark` the edit was manual, so the value is the user's own.
 */
export function updateMarks(marks: Readonly<Record<string, AiMark>>, written: readonly WrittenValue[], mark: AiMark | null) {
  const next: Record<string, AiMark> = { ...marks }
  for (const entry of written) {
    for (const key of Object.keys(next)) {
      if (key === entry.key || key.startsWith(`${entry.key}.`)) delete next[key]
    }
    if (mark) for (const leaf of writtenLeaves(entry)) next[leaf] = mark
  }
  return next
}
