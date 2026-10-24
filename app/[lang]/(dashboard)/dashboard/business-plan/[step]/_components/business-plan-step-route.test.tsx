// @vitest-environment node
import { describe, expect, it } from "vitest"
import { ProjectGate } from "../../../_components/project-gate"
import { BusinessPlanStep } from "../_steps/business-plan-step"
import { BusinessPlanStepRoute } from "./business-plan-step-route"

const params = (step: string, lang = "en") => Promise.resolve({ lang, step })

describe("BusinessPlanStepRoute", () => {
  it("gates on the module and renders every step", async () => {
    for (const step of ["opportunity", "business-logic", "reality-check", "implementation"]) {
      const tree = await BusinessPlanStepRoute({ params: params(step, "de") })
      expect(tree.type).toBe(ProjectGate)
      expect(tree.props.module).toBe("businessPlan")
      expect(tree.props.children.type).toBe(BusinessPlanStep)
      expect(tree.props.children.props).toEqual({ step })
    }
  })

  it("is a 404 for an unknown step or language", async () => {
    await expect(BusinessPlanStepRoute({ params: params("area") })).rejects.toThrow()
    await expect(BusinessPlanStepRoute({ params: params("opportunity", "xx") })).rejects.toThrow()
  })
})
