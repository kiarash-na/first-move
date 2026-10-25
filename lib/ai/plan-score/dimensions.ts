/**
 * The seven dimensions of a solid 5GDHC business plan (D-75, PLAN-AI-SCORE-01 § Dimensions). They
 * start from the provider's study, ALG-04 "Aspects for successful implementation" (technology,
 * costs, implementation models: ownership and operation, organisation and governance,
 * (re-)financing; participation) with ALG-05, ALG-09 and ALG-10, and add the reality check and the
 * path of BM-STEP-03/04. Cross-checked against desirability, feasibility and viability
 * (SRC-BROWN-2008, SRC-BLAND-2020), the canvas, the ARENA Commercial Readiness Index and the HM
 * Treasury five cases. Weights are reasoned defaults (no source prescribes numbers) and sum to 1.
 */
export const DIMENSIONS = [
  { id: "value", weight: 0.15 },
  { id: "technology", weight: 0.1 },
  { id: "economics", weight: 0.2 },
  { id: "governance", weight: 0.2 },
  { id: "participation", weight: 0.15 },
  { id: "evidence", weight: 0.1 },
  { id: "path", weight: 0.1 },
] as const

export type DimensionId = (typeof DIMENSIONS)[number]["id"]
export const DIMENSION_IDS: readonly DimensionId[] = DIMENSIONS.map((dimension) => dimension.id)

/** English names for the text model's prompt; the UI takes its names from `ai-score.json`. */
export const DIMENSION_LABELS: Record<DimensionId, string> = {
  value: "Customer value and demand",
  technology: "Technical and site fit",
  economics: "Costs, revenues and financing",
  governance: "Ownership, operation and governance",
  participation: "Participation and commitment",
  evidence: "Risks, assumptions and evidence",
  path: "Implementation path and scalability",
}
