// @vitest-environment node
import { describe, expect, it } from "vitest"
import { emptyValue } from "@/lib/project/empty-value"
import { businessPlanSchema } from "./index"

describe("businessPlanSchema", () => {
  it("lists the PLAN-DASH-00 Business Plan sections", () => {
    expect(Object.keys(businessPlanSchema.shape)).toEqual([
      "scenarioId",
      "opportunity",
      "canvas",
      "allocation",
      "assumptions",
      "criticalAssumptions",
      "risks",
      "refinements",
      "scalability",
      "nextSteps",
    ])
  })

  it("accepts an empty Business Plan and each scenario id (OQ-25)", () => {
    const empty = emptyValue(businessPlanSchema) as Record<string, unknown>
    expect(businessPlanSchema.safeParse(empty).success).toBe(true)
    for (const scenarioId of ["BM-SCN-01", "BM-SCN-04", "custom"]) {
      expect(businessPlanSchema.safeParse({ ...empty, scenarioId }).success).toBe(true)
    }
    expect(businessPlanSchema.safeParse({ ...empty, scenarioId: "BM-SCN-05" }).success).toBe(false)
  })
})
