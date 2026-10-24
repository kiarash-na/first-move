// @vitest-environment node
import { describe, expect, it } from "vitest"
import { applyPatch } from "@/lib/project/apply-patch"
import { createProject } from "@/lib/project/create-project"
import { readInputs } from "../inputs"
import { effectiveParameters } from "../params"
import { demandStage } from "./demand"

function stage(patch: Record<string, unknown>) {
  const { project } = applyPatch(createProject({ modules: { quickCheck: true } }), patch, { atomic: true })
  return demandStage(readInputs(project), effectiveParameters(project.quickCheck.overrides), 10)
}

describe("demand stage (EQ-3.1, EQ-3.2a-d)", () => {
  it("computes all 25 cells and the totals", () => {
    const result = stage({ "buildings.shares.category_c.until_1919": 40, "buildings.shares.category_b.1961_1990": 60 })
    expect(result.cells).toHaveLength(25)
    // category C -1919: 10 · 0.4 = 4 buildings · 204 · 730 = 595 680 kWh/a heating, 4 · 5.2 · 730 = 15 184 cooling
    // category B 1961-1990: 6 · 132.8 · 1 597.5 = 1 272 888 heating, 6 · 7.5 · 1 597.5 = 71 887.5 cooling
    expect(result.estimatedHeatingDemandKwh).toBeCloseTo(595_680 + 1_272_888, 6)
    expect(result.estimatedCoolingDemandKwh).toBeCloseTo(15_184 + 71_887.5, 6)
    expect(result.heatingDemandKwh).toBe(result.estimatedHeatingDemandKwh)
  })

  it("replaces a total by its manual value only (OQ-05)", () => {
    const result = stage({
      "buildings.shares.residential.until_1919": 100,
      "quickCheck.manualDemand.coolingKwhPerYear": 1_234,
    })
    // 10 · 124.4 · 547.5 = 681 090 kWh/a stays estimated
    expect(result.heatingDemandKwh).toBeCloseTo(681_090, 6)
    expect(result.coolingDemandKwh).toBe(1_234)
    expect(result.estimatedCoolingDemandKwh).toBeCloseTo(10 * 10 * 547.5, 6)
  })
})
