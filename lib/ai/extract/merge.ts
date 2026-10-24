import type { CatalogueField } from "./field-catalogue"
import type { NormalizedValue, ProposalValue, ValueSource } from "./to-patch"

/** A value of the merged proposal, with every place it was read. */
export interface MergedValue {
  id: string
  field: CatalogueField
  value: ProposalValue
  /** The new row of an item list: `<group>:<item>`, so rows from different outputs stay apart. */
  row?: string
  sources: ValueSource[]
}

/** Different values found for one field: the user decides, nothing is picked silently. */
export interface Conflict {
  id: string
  label: string
  row?: string
  candidates: { value: ProposalValue; sources: ValueSource[] }[]
}

const comparable = (value: ProposalValue) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim().toLowerCase() : value)

function same(a: ProposalValue, b: ProposalValue): boolean {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b))
  return comparable(a) === comparable(b)
}

/**
 * Merges the values of several outputs (files or messages) into one proposal (PLAN-AGENT-03
 * step 4). Equal values join, with all their sources; different values for one field, or for one
 * property of one row, become a conflict. Text list entries are collected (each once); rows of item
 * lists stay separate per output.
 */
export function mergeValues(groups: readonly (readonly NormalizedValue[])[]): { values: MergedValue[]; conflicts: Conflict[] } {
  const slots = new Map<string, { field: CatalogueField; row?: string; candidates: { value: ProposalValue; sources: ValueSource[] }[] }>()
  groups.forEach((values, group) => {
    for (const { id, field, value, item, source } of values) {
      const row = item === undefined ? undefined : `${group}:${item}`
      const slot = field.kind === "textList" ? `${id}\u{0}${comparable(value)}` : `${id}\u{0}${row ?? ""}`
      const entry = slots.get(slot) ?? { field, ...(row && { row }), candidates: [] }
      const match = entry.candidates.find((candidate) => same(candidate.value, value))
      if (match) match.sources.push(source)
      else entry.candidates.push({ value, sources: [source] })
      slots.set(slot, entry)
    }
  })
  const values: MergedValue[] = []
  const conflicts: Conflict[] = []
  for (const { field, row, candidates } of slots.values()) {
    if (candidates.length === 1) values.push({ id: field.id, field, value: candidates[0].value, ...(row && { row }), sources: candidates[0].sources })
    else conflicts.push({ id: field.id, label: field.label, ...(row && { row }), candidates })
  }
  return { values, conflicts }
}
