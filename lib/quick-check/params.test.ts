// @vitest-environment node
import { describe, expect, it } from "vitest"
import { createProject } from "@/lib/project/create-project"
import type { ParameterOverrides } from "@/lib/project/schema/overrides"
import { effectiveParameters, fromPercent } from "./params"

const defaults = (): ParameterOverrides =>
  createProject({ modules: { quickCheck: true }, id: "00000000-0000-4000-8000-000000000000" }).quickCheck.overrides

describe("effective parameters", () => {
  it("uses the TBL-1..3 defaults per cell, industry as 0 (OQ-02)", () => {
    const params = effectiveParameters(defaults())
    expect(params.buildings.residential["1991_2010"]).toEqual({
      heatingDemandPerM2: 92.5,
      coolingDemandPerM2: 8.5,
      floorAreaM2: 408,
      hasDefaults: true,
    })
    expect(params.buildings.industry.until_1919).toEqual({
      heatingDemandPerM2: 0,
      coolingDemandPerM2: 0,
      floorAreaM2: 0,
      hasDefaults: false,
    })
  })

  it("uses the TBL-4/5 defaults and keeps dashes as null (OQ-13)", () => {
    const params = effectiveParameters(defaults())
    expect(params.heating.geothermal).toEqual({ low: 10_000, medium: 50_000, high: 150_000, cop: 4.5 })
    expect(params.heating.solar_thermal.cop).toBeNull()
    expect(params.cooling.waste_heat).toEqual({ low: null, medium: null, high: null, cop: null })
    expect(params.cooling.ambient_air.cop).toBe(3.5)
  })

  it("divides the TBL-6 % rows by 100 once (OQ-01) and uses 0 for the ambient-air dash (OQ-18)", () => {
    const { economic } = effectiveParameters(defaults())
    expect(economic.interest_rate).toBe(0.03)
    expect(economic.pv_cost_reduction).toBe(0.3)
    expect(economic.depreciation_period).toBe(20)
    expect(economic.heat_pump).toBe(15_000)
    expect(economic.installation_costs_ambient_air).toBe(0)
  })

  it("is not custom without overrides", () => {
    const params = effectiveParameters(defaults())
    expect(params.isCustom).toBe(false)
    expect(params.customFields).toEqual([])
  })

  it("applies TBL-4/5/6 overrides and marks them custom (D-10)", () => {
    const overrides = defaults()
    overrides.heating.geothermal.high = 400_000
    overrides.cooling.ground_water.cop = 6
    overrides.economic.interest_rate = 5
    overrides.economic.installation_costs_ambient_air = 0.4
    const params = effectiveParameters(overrides)
    expect(params.heating.geothermal.high).toBe(400_000)
    expect(params.heating.geothermal.medium).toBe(50_000)
    expect(params.cooling.ground_water.cop).toBe(6)
    expect(params.economic.interest_rate).toBe(0.05)
    expect(params.economic.installation_costs_ambient_air).toBe(0.4)
    expect(params.isCustom).toBe(true)
    expect(params.customFields).toEqual([
      "quickCheck.overrides.heating.geothermal.high",
      "quickCheck.overrides.cooling.ground_water.cop",
      "quickCheck.overrides.economic.installation_costs_ambient_air",
      "quickCheck.overrides.economic.interest_rate",
    ])
  })

  it("counts an override of 0 as custom", () => {
    const overrides = defaults()
    overrides.economic.connection_fee = 0
    const params = effectiveParameters(overrides)
    expect(params.economic.connection_fee).toBe(0)
    expect(params.isCustom).toBe(true)
  })

  it("converts a percentage to a fraction", () => {
    expect(fromPercent(25)).toBe(0.25)
    expect(fromPercent(100)).toBe(1)
  })
})
