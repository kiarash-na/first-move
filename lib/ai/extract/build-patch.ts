import { createListItem, getAt, parsePath, type Project } from "@/lib/project"
import type { MergedValue } from "./merge"
import type { ProposalValue, ValueSource } from "./to-patch"

/** One key of a proposed patch, with the label and sources the review shows. */
export interface ProposalEntry {
  /** Patch key: a field id, or a whole list (existing entries kept, new ones appended). */
  key: string
  value: unknown
  label: string
  sources: ValueSource[]
}

const listAt = (project: Project, id: string): unknown[] => {
  const value = getAt(project, parsePath(id) ?? [])
  return Array.isArray(value) ? value : []
}

const comparable = (value: unknown) => (typeof value === "string" ? value.trim().toLowerCase() : value)

interface TextList {
  label: string
  added: ProposalValue[]
  sources: ValueSource[]
}

interface ItemList {
  label: string
  /** New rows by their `row` key, property → value. */
  rows: Map<string, Record<string, ProposalValue>>
  sources: ValueSource[]
}

/**
 * Turns merged values into patch entries (PLAN-AGENT-03 step 4): one per value field; text lists
 * and item lists become a whole-list patch that keeps every existing entry and appends the new
 * ones (an entry already in the list is not added twice); new rows get fresh ids.
 */
export function buildPatch(values: readonly MergedValue[], project: Project, newId: () => string = () => crypto.randomUUID()): ProposalEntry[] {
  const entries: ProposalEntry[] = []
  const lists = new Map<string, TextList>()
  const rows = new Map<string, ItemList>()

  for (const { field, value, row, sources } of values) {
    if (field.property && row) {
      const list: ItemList = rows.get(field.fieldId) ?? { label: field.listLabel ?? field.label, rows: new Map(), sources: [] }
      list.rows.set(row, { ...list.rows.get(row), [field.property]: value })
      list.sources.push(...sources)
      rows.set(field.fieldId, list)
    } else if (field.kind === "textList") {
      const list: TextList = lists.get(field.fieldId) ?? { label: field.label, added: [], sources: [] }
      list.added.push(value)
      list.sources.push(...sources)
      lists.set(field.fieldId, list)
    } else {
      entries.push({ key: field.fieldId, value, label: field.label, sources })
    }
  }

  for (const [key, { label, added, sources }] of lists) {
    const existing = listAt(project, key)
    const known = new Set(existing.map(comparable))
    entries.push({ key, value: [...existing, ...added.filter((entry) => !known.has(comparable(entry)))], label, sources })
  }
  for (const [key, list] of rows) {
    const appended = [...list.rows.values()].map((properties) => ({ ...createListItem(key, newId()), ...properties }))
    entries.push({ key, value: [...listAt(project, key), ...appended], label: list.label, sources: list.sources })
  }
  return entries
}
