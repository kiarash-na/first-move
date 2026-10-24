// @vitest-environment node
import { describe, expect, it } from "vitest"
import { ECONOMIC_PARAMETERS } from "@/lib/project/catalog/economic-parameters"
import { overridesSchema } from "./overrides"

const { heating, cooling, economic } = overridesSchema.shape

describe("overridesSchema (D-10)", () => {
  it("overrides a capacity cell with a number, or keeps the default with null", () => {
    const geothermal = heating.shape.geothermal.shape
    expect(geothermal.high.safeParse(200_000).success).toBe(true)
    expect(geothermal.high.safeParse(null).success).toBe(true)
    expect(geothermal.high.safeParse(-1).success).toBe(false)
  })

  it("keeps cells without a default null-only (OQ-13)", () => {
    expect(heating.shape.solar_thermal.shape.cop.safeParse(null).success).toBe(true)
    expect(heating.shape.solar_thermal.shape.cop.safeParse(4).success).toBe(false)
    expect(cooling.shape.waste_heat.shape.low.safeParse(1000).success).toBe(false)
    expect(cooling.shape.solar_thermal.shape.cop.safeParse(3).success).toBe(false)
  })

  it("needs a heating COP above 1 and a cooling COP above 0", () => {
    expect(heating.shape.geothermal.shape.cop.safeParse(1).success).toBe(false)
    expect(heating.shape.geothermal.shape.cop.safeParse(1.1).success).toBe(true)
    expect(cooling.shape.geothermal.shape.cop.safeParse(0).success).toBe(false)
    expect(cooling.shape.geothermal.shape.cop.safeParse(0.5).success).toBe(true)
  })

  it("has one nullable override per TBL-6 row, within its limit", () => {
    expect(Object.keys(economic.shape)).toEqual([...ECONOMIC_PARAMETERS])
    expect(economic.shape.interest_rate.safeParse(3).success).toBe(true)
    expect(economic.shape.interest_rate.safeParse(101).success).toBe(false)
    expect(economic.shape.depreciation_period.safeParse(20.5).success).toBe(false)
    expect(economic.shape.depreciation_period.safeParse(0).success).toBe(false)
    expect(economic.shape.installation_costs_ambient_air.safeParse(0.4).success).toBe(true)
  })
})
