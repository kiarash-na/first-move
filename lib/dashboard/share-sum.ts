import { groupRuleStatus } from "@/lib/project/completeness/group-rule"
import { fieldsOf, getGroup } from "@/lib/project/fields/registry"
import { getAt, parsePath } from "@/lib/project/path"
import type { Project } from "@/lib/project/schema/project"

export const SHARE_GROUP = "buildings.shares"

/** The four states of the live share sum (QCT-IN-04, R-03, D-31). */
export type ShareSumState = "empty" | "under" | "exact" | "over"

export interface ShareSum {
  /** Sum of all cells in % (empty cells count as 0). */
  sum: number
  state: ShareSumState
  /** 100 − sum (negative when over). */
  remaining: number
  /** Per building type (row) and per period (column), in %. */
  rows: Record<string, number>
  columns: Record<string, number>
}

/**
 * The live sum of the share grid. `exact` uses the group rule (100 within float tolerance), so
 * the UI says "complete" exactly when the engine accepts the shares; nothing entered is `empty`.
 */
export function shareSum(project: Project): ShareSum {
  const group = getGroup(SHARE_GROUP)!
  const status = groupRuleStatus(project, group)
  const rows: Record<string, number> = Object.fromEntries((group.rows?.keys ?? []).map((key) => [key, 0]))
  const columns: Record<string, number> = Object.fromEntries((group.columns?.keys ?? []).map((key) => [key, 0]))
  let entered = 0
  for (const field of fieldsOf({ group: SHARE_GROUP })) {
    const value = getAt(project, parsePath(field.id) ?? [])
    if (typeof value !== "number") continue
    entered += 1
    rows[field.row!] += value
    columns[field.column!] += value
  }
  const sum = status.value
  const state: ShareSumState = status.ok ? "exact" : entered === 0 ? "empty" : sum > 100 ? "over" : "under"
  return { sum, state, remaining: 100 - sum, rows, columns }
}
