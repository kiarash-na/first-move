import { describe, expect, it } from "vitest"
import { fieldIdsOf, JUDGEMENTS } from "@/lib/ai/plan-score/judgements"
import { stepsOf } from "./plan-steps"

describe("stepsOf", () => {
  it("finds a Business Plan step for every judgement of the engine", () => {
    for (const judgement of JUDGEMENTS) expect(stepsOf(fieldIdsOf(judgement)).length, judgement.id).toBeGreaterThan(0)
  })

  it("lists each step once, in step order", () => {
    expect(stepsOf(["businessPlan.assumptions.capex", "businessPlan.canvas.costStructure"])).toEqual(["business-logic", "reality-check"])
    expect(stepsOf(["site.name", "site.location"])).toEqual(["opportunity"])
  })

  it("ignores ids that are not in the registry", () => {
    expect(stepsOf(["not.a.field"])).toEqual([])
  })
})
