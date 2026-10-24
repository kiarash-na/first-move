import { fieldsOf, groupsOf } from "@/lib/project/fields/registry"
import type { FieldModule } from "@/lib/project/fields/types"
import type { FieldStep } from "@/lib/project/fields/steps"
import { getAt, parsePath } from "@/lib/project/path"
import type { Project } from "@/lib/project/schema/project"
import { groupRuleStatus } from "./group-rule"

export interface InputStatus {
  /** Every required field is filled and every group rule holds. */
  complete: boolean
  /** Ids of required fields that are empty and of groups whose rule fails, in registry order. */
  missing: string[]
  /** Steps with something missing, for the stepper. */
  incompleteSteps: FieldStep[]
}

/**
 * Whether a module's inputs are enough for a result. For the Quick Check: buildings and area
 * entered, shares add up to 100, at least one source selected; otherwise the project is
 * incomplete and shows no result (R-03). The Business Plan has no required inputs (D-27).
 */
export function inputStatus(project: Project, module: FieldModule): InputStatus {
  const missingFields = fieldsOf({ module }).filter(
    (field) => field.required && getAt(project, parsePath(field.id) ?? []) === null,
  )
  const failingGroups = groupsOf({ module }).filter((group) => group.rule && !groupRuleStatus(project, group).ok)
  const missing = [...missingFields, ...failingGroups]
  return {
    complete: missing.length === 0,
    missing: missing.map((entry) => entry.id),
    incompleteSteps: [...new Set(missing.map((entry) => entry.step))],
  }
}
