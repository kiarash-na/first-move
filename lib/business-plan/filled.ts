import { getAt, parsePath } from "@/lib/project/path"
import type { Project } from "@/lib/project/schema/project"

/**
 * What counts as "filled in" for the Business Plan (D-27: qualitative, text stored as typed).
 * Text counts when it has a visible character; the stored value is never trimmed or changed.
 */
export const isTextFilled = (value: unknown): boolean => typeof value === "string" && value.trim() !== ""

/** The properties every row of an item list needs before the row counts as complete. */
export const ROW_REQUIRED = {
  "businessPlan.allocation": ["stakeholder", "investment", "risk", "benefit"],
  "businessPlan.criticalAssumptions": ["statement", "validation"],
  "businessPlan.risks": ["title", "description", "validation"],
} as const satisfies Record<string, readonly string[]>

export type RowListId = keyof typeof ROW_REQUIRED

export interface RowsStatus {
  /** Rows with every required property filled. */
  complete: number
  /** Rows with some but not all required properties: started, not finished. */
  partial: number
}

/** Counts complete and half-filled rows; an untouched blank row is ignored. */
export function rowsStatus(project: Project, listId: RowListId): RowsStatus {
  const rows = (getAt(project, parsePath(listId) ?? []) as Record<string, unknown>[] | undefined) ?? []
  const required: readonly string[] = ROW_REQUIRED[listId]
  let complete = 0
  let partial = 0
  for (const row of rows) {
    const filled = required.filter((key) => isTextFilled(row[key])).length
    if (filled === required.length) complete += 1
    else if (filled > 0) partial += 1
  }
  return { complete, partial }
}

/**
 * Whether one registry field is done. A list of rows is done with at least one complete row and
 * no half-filled one ("validation for each risk"); a text list needs one non-blank entry.
 */
export function isFieldFilled(project: Project, fieldId: string, kind: string): boolean {
  const value = getAt(project, parsePath(fieldId) ?? [])
  switch (kind) {
    case "choice":
      return value !== null && value !== undefined
    case "textList":
      return Array.isArray(value) && value.some(isTextFilled)
    case "items": {
      const status = rowsStatus(project, fieldId as RowListId)
      return status.complete >= 1 && status.partial === 0
    }
    default:
      return isTextFilled(value)
  }
}
