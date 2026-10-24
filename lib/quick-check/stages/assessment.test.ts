// @vitest-environment node
import { describe, expect, it } from "vitest"
import { createProject } from "@/lib/project/create-project"
import { readInputs } from "../inputs"
import type { QuickCheckValues } from "../types"
import { assessmentStage } from "./assessment"

const inputs = readInputs(createProject({ modules: { quickCheck: true } }))

const values = {
  buildingDensity: 31,
  heatDensityMwhPerM: 0.4,
  heatingCoverage: 0.95,
  coolingCoverage: null,
  chRatio: 0.5,
  economicRatio: 0.8,
} as QuickCheckValues

describe("assessment stage", () => {
  it("classifies the indicators", () => {
    expect(assessmentStage(values, inputs).classes).toEqual({
      heatingCoverage: "conditionally_feasible",
      coolingCoverage: null,
      buildingDensity: "high",
      densityCategory: "urban",
      heatDensity: "low",
      chRatio: "partially_balanced",
      economic: "unclear",
    })
  })

  it("applies the overall rule and lists the drivers", () => {
    const { assessment, drivers } = assessmentStage(values, inputs)
    expect(assessment.level).toBe("further_analysis")
    expect(assessment.reasons.map((reason) => reason.code)).toEqual(["economics_unclear", "heat_density_low"])
    expect(drivers.limiting.map((driver) => driver.id)).toEqual(["economics", "heat_density"])
    expect(drivers.supporting.map((driver) => driver.id)).toEqual(["heating_coverage", "building_density"])
  })

  it("passes the forced triggers through", () => {
    const forced = { ...inputs, industry: true, unknownSources: ["geothermal" as const] }
    const { assessment } = assessmentStage(values, forced)
    expect(assessment).toMatchObject({ level: "further_analysis", forced: true })
  })
})
