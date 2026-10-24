// @vitest-environment node
import { describe, expect, it } from "vitest"
import { electricityCosts, sourceElectricityCosts } from "./eq-3-11-electricity-costs"

const groundWater = { heatingSupply: 12_500, heatingCop: 5, coolingSupply: 8_000, coolingCop: 4 }
const solarThermal = { heatingSupply: 20_000, heatingCop: null, coolingSupply: 0, coolingCop: null }

describe("EQ-3.11 electricity costs", () => {
  it("adds the heating and cooling electricity of a source", () => {
    // 12 500 / 5 · 0.2 + 8 000 / 4 · 0.2 = 500 + 400 = 900 €/a
    expect(sourceElectricityCosts(groundWater, 0.2)).toBeCloseTo(900, 9)
  })

  it("has no electricity for a source without COP (solar thermal, OQ-13)", () => {
    expect(sourceElectricityCosts(solarThermal, 0.2)).toBe(0)
  })

  it("sums over the selected sources (OQ-11)", () => {
    // 900 + 0 + (10 000 / 4 · 0.2 = 500) = 1 400 €/a
    const ambient = { heatingSupply: 10_000, heatingCop: 4, coolingSupply: 0, coolingCop: 3.5 }
    expect(electricityCosts([groundWater, solarThermal, ambient], 0.2)).toBeCloseTo(1_400, 9)
    expect(electricityCosts([], 0.2)).toBe(0)
  })

  it("is null when a COP is 0", () => {
    const broken = { ...groundWater, coolingCop: 0 }
    expect(sourceElectricityCosts(broken, 0.2)).toBeNull()
    expect(electricityCosts([groundWater, broken], 0.2)).toBeNull()
  })
})
