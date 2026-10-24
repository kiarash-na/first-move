import { z } from "zod"
import { SCENARIO_IDS } from "@/lib/project/catalog/scenarios"
import { allocationSchema, canvasSchema } from "./business-logic"
import { refinementsSchema, nextStepsSchema, scalabilitySchema } from "./implementation"
import { opportunitySchema } from "./opportunity"
import { assumptionsSchema, criticalAssumptionsSchema, risksSchema } from "./reality-check"

/** The Business Plan module (BM-STEP-01..04): a qualitative workspace (D-27), one model per project (D-29). */
export const businessPlanSchema = z
  .strictObject({
    scenarioId: z
      .enum(SCENARIO_IDS)
      .nullable()
      .meta({ description: "Preset the use case started from (BM-SCN-01..04) or 'custom' (OQ-25); null = not chosen." }),
    opportunity: opportunitySchema,
    canvas: canvasSchema,
    allocation: allocationSchema,
    assumptions: assumptionsSchema,
    criticalAssumptions: criticalAssumptionsSchema,
    risks: risksSchema,
    refinements: refinementsSchema,
    scalability: scalabilitySchema,
    nextSteps: nextStepsSchema,
  })
  .meta({ description: "Business Plan module (BM-STEP-01..04). Free text is stored as typed." })

export type BusinessPlan = z.infer<typeof businessPlanSchema>

export * from "./business-logic"
export * from "./implementation"
export * from "./opportunity"
export * from "./reality-check"
