import type { RowListId } from "./filled"

/**
 * The checks behind the pitch readiness (D-30). Each check says what a pitch needs in terms of
 * filled fields; the pitch sections (BM-SCOPE-07) and the V01 jury criteria (BM-SCOPE-08) both
 * list checks by id, so a field counts the same everywhere. Labels: `readiness.checks.<id>` in
 * the `business-plan` dictionary.
 */
export type ReadinessCheck =
  /** A text field with a visible character. */
  | { kind: "text"; field: string; step: "opportunity" | "business-logic" | "reality-check" | "implementation" }
  /** A list of one-line entries with at least one non-blank entry. */
  | { kind: "list"; field: string; step: "opportunity" }
  /** An item list with a complete row and no half-filled row. */
  | { kind: "rows"; field: RowListId; step: "business-logic" | "reality-check" }
  /** One row is marked as the potential deal-breaker (BM-STEP-03). */
  | { kind: "dealBreaker"; field: "businessPlan.risks"; step: "reality-check" }

const text = (field: string, step: Extract<ReadinessCheck, { kind: "text" }>["step"]): ReadinessCheck => ({
  kind: "text",
  field,
  step,
})

export const CHECKS = {
  // BM-STEP-01
  site: text("site.name", "opportunity"),
  painPoint: text("businessPlan.opportunity.painPoint", "opportunity"),
  customers: text("businessPlan.opportunity.customerSegments", "opportunity"),
  needs: text("businessPlan.opportunity.needs", "opportunity"),
  heatSources: text("businessPlan.opportunity.heatSources", "opportunity"),
  advantage: text("businessPlan.opportunity.advantage", "opportunity"),
  stakeholders: { kind: "list", field: "site.stakeholders", step: "opportunity" },
  // BM-STEP-02
  valueProposition: text("businessPlan.canvas.valueProposition", "business-logic"),
  canvasCustomers: text("businessPlan.canvas.customerSegments", "business-logic"),
  customerRelationships: text("businessPlan.canvas.customerRelationships", "business-logic"),
  keyPartners: text("businessPlan.canvas.keyPartners", "business-logic"),
  operator: text("businessPlan.canvas.operatorResponsibilities", "business-logic"),
  revenueStreams: text("businessPlan.canvas.revenueStreams", "business-logic"),
  allocation: { kind: "rows", field: "businessPlan.allocation", step: "business-logic" },
  // BM-STEP-03
  connectionRate: text("businessPlan.assumptions.connectionRate", "reality-check"),
  tariffs: text("businessPlan.assumptions.tariffs", "reality-check"),
  capex: text("businessPlan.assumptions.capex", "reality-check"),
  financing: text("businessPlan.assumptions.financing", "reality-check"),
  subsidies: text("businessPlan.assumptions.subsidies", "reality-check"),
  criticalAssumptions: { kind: "rows", field: "businessPlan.criticalAssumptions", step: "reality-check" },
  risks: { kind: "rows", field: "businessPlan.risks", step: "reality-check" },
  dealBreaker: { kind: "dealBreaker", field: "businessPlan.risks", step: "reality-check" },
  // BM-STEP-04
  feedback: text("businessPlan.refinements.feedback", "implementation"),
  changes: text("businessPlan.refinements.changes", "implementation"),
  scalabilityGeographical: text("businessPlan.scalability.geographical", "implementation"),
  scalabilityEconomic: text("businessPlan.scalability.economic", "implementation"),
  scalabilityOrganisational: text("businessPlan.scalability.organisational", "implementation"),
  nextData: text("businessPlan.nextSteps.data", "implementation"),
  nextStakeholders: text("businessPlan.nextSteps.stakeholders", "implementation"),
  nextPartnerships: text("businessPlan.nextSteps.partnerships", "implementation"),
  nextPilots: text("businessPlan.nextSteps.pilots", "implementation"),
  nextDecisions: text("businessPlan.nextSteps.decisions", "implementation"),
} as const satisfies Record<string, ReadinessCheck>

export type CheckId = keyof typeof CHECKS

/**
 * The six aspects of the final pitch (BM-SCOPE-07, V02), each as the checks that show the team
 * has an answer to the question the brief asks.
 */
export const PITCH_SECTIONS = [
  { id: "useCase", checks: ["site", "painPoint", "customers", "needs", "advantage", "valueProposition"] },
  {
    id: "businessModel",
    checks: ["valueProposition", "canvasCustomers", "keyPartners", "customerRelationships", "revenueStreams", "stakeholders"],
  },
  { id: "feasibility", checks: ["allocation", "operator", "capex", "financing", "tariffs", "connectionRate", "subsidies"] },
  { id: "realityCheck", checks: ["criticalAssumptions", "risks", "dealBreaker", "changes"] },
  { id: "scalability", checks: ["scalabilityGeographical", "scalabilityEconomic", "scalabilityOrganisational"] },
  { id: "nextSteps", checks: ["nextData", "nextStakeholders", "nextPartnerships", "nextPilots", "nextDecisions"] },
] as const satisfies readonly { id: string; checks: readonly CheckId[] }[]

/**
 * The proposed jury evaluation criteria of the V01 brief (BM-SCOPE-08). They are not official
 * for this event (D-30), so the UI labels them as unofficial.
 */
export const JURY_CRITERIA = [
  { id: "problemSolutionFit", checks: ["painPoint", "customers", "needs", "heatSources", "advantage"] },
  { id: "coherence", checks: ["valueProposition", "customerRelationships", "revenueStreams", "allocation", "stakeholders"] },
  { id: "plausibility", checks: ["capex", "financing", "tariffs", "connectionRate", "nextPilots", "nextDecisions"] },
  { id: "riskQuality", checks: ["criticalAssumptions", "risks", "dealBreaker", "feedback"] },
  { id: "scalabilityClarity", checks: ["scalabilityGeographical", "scalabilityEconomic", "scalabilityOrganisational", "changes"] },
] as const satisfies readonly { id: string; checks: readonly CheckId[] }[]

export type PitchSectionId = (typeof PITCH_SECTIONS)[number]["id"]
export type JuryCriterionId = (typeof JURY_CRITERIA)[number]["id"]
