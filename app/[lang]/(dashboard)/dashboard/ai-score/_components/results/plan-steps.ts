import { BUSINESS_PLAN_STEPS, getField, type BusinessPlanStep } from "@/lib/project/fields"

/**
 * The Business Plan steps where the fields of a judgement are edited, in step order, read from
 * the field registry (D-05). A merged judgement can span two steps (costs: canvas and reality check).
 */
export function stepsOf(fields: readonly string[]): BusinessPlanStep[] {
  const steps = new Set(fields.map((id) => getField(id)?.step))
  return BUSINESS_PLAN_STEPS.filter((step) => steps.has(step))
}
