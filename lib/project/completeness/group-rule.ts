import { fieldsOf } from "@/lib/project/fields/registry"
import type { FieldGroup } from "@/lib/project/fields/types"
import { getAt, parsePath } from "@/lib/project/path"
import type { Project } from "@/lib/project/schema/project"

export interface GroupRuleStatus {
  ok: boolean
  /** The share sum (rule `sum`) or the number of selected entries (rule `min-selected`). */
  value: number
}

const valuesOf = (project: Project, group: FieldGroup) =>
  fieldsOf({ group: group.id }).map((field) => getAt(project, parsePath(field.id) ?? []))

/**
 * Checks a group's rule against the project: the share grid must add up to 100 within float
 * tolerance (QCT-IN-04, R-03); at least one source must be selected (QCT-IN-06). Empty cells
 * count as 0; a selected entry is any value other than null and false.
 */
export function groupRuleStatus(project: Project, group: FieldGroup): GroupRuleStatus {
  const values = valuesOf(project, group)
  switch (group.rule?.kind) {
    case "sum": {
      const sum = values.reduce<number>((total, value) => total + (typeof value === "number" ? value : 0), 0)
      return { ok: Math.abs(sum - group.rule.target) <= group.rule.tolerance, value: sum }
    }
    case "min-selected": {
      const selected = values.filter((value) => value !== null && value !== false).length
      return { ok: selected >= group.rule.min, value: selected }
    }
    default:
      return { ok: true, value: 0 }
  }
}
