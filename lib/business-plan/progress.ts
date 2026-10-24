import { fieldsOf } from "@/lib/project/fields/registry"
import { BUSINESS_PLAN_STEPS, type BusinessPlanStep } from "@/lib/project/fields/steps"
import type { Project } from "@/lib/project/schema/project"
import { isFieldFilled } from "./filled"

/**
 * Fields a scenario may leave unstated (BM-SCN-01 gives no current supply, BM-SCN-03/04 "to be
 * identified" partners), so a step can reach 100 % without them. They still count when filled.
 */
export const OPTIONAL_FIELDS: readonly string[] = ["site.currentSupply", "site.partners"]

export interface StepProgress {
  step: BusinessPlanStep
  /** Fields (or lists of complete rows) that are filled in, and the fields that count. */
  done: number
  total: number
  /** 0..1 */
  fraction: number
  /** Registry ids still empty, in registry order. */
  missing: string[]
}

/** Progress of one step: how many of its registry fields are filled (BM-SCOPE-11, D-28). */
export function stepProgress(project: Project, step: BusinessPlanStep): StepProgress {
  const fields = fieldsOf({ module: "businessPlan", step })
  const counted = fields.map((field) => ({ field, filled: isFieldFilled(project, field.id, field.kind) }))
  const required = counted.filter(({ field, filled }) => filled || !OPTIONAL_FIELDS.includes(field.id))
  const done = required.filter(({ filled }) => filled).length
  return {
    step,
    done,
    total: required.length,
    fraction: required.length === 0 ? 0 : done / required.length,
    missing: counted.filter(({ filled, field }) => !filled && !OPTIONAL_FIELDS.includes(field.id)).map(({ field }) => field.id),
  }
}

/** Progress of all four steps, in order; the steps can be done in any order (D-28). */
export function allProgress(project: Project): StepProgress[] {
  return BUSINESS_PLAN_STEPS.map((step) => stepProgress(project, step))
}

/** The whole module as one fraction of all counted fields. */
export function overallProgress(progress: readonly StepProgress[]): number {
  const total = progress.reduce((sum, entry) => sum + entry.total, 0)
  return total === 0 ? 0 : progress.reduce((sum, entry) => sum + entry.done, 0) / total
}
