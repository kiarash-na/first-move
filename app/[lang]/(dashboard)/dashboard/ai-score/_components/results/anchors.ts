import { judgementOf } from "@/lib/ai/plan-score/judgements"
import { gateInfo } from "./gate-info"

/** Element ids of the result rows, so the report's chips can jump to the part or check they name. */
export const partAnchor = (id: string) => `ai-score-part-${id}`
export const checkAnchor = (id: string) => `ai-score-check-${id}`

/** The row a report or suggestion key points to: a plan part (judgement) or a check; null when unknown. */
export function keyAnchor(key: string): string | null {
  if (judgementOf(key)) return partAnchor(key)
  if (gateInfo(key)) return checkAnchor(key)
  return null
}
