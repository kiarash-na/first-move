// @vitest-environment node
import { describe, expect, it } from "vitest"
import { heatingSupply } from "./eq-3-08a-heating-supply"

describe("EQ-3.8a heating supply", () => {
  it("adds the heat pump's share of the delivered heat", () => {
    // 10 000 kWh/a · 5 / (5 − 1) = 12 500 kWh/a
    expect(heatingSupply(10_000, 5)).toBe(12_500)
    // geothermal medium: 50 000 · 4.5 / 3.5 = 64 285.714… kWh/a
    expect(heatingSupply(50_000, 4.5)).toBeCloseTo(64_285.714286, 5)
  })

  it("equals the capacity for a source without COP (solar thermal, OQ-13)", () => {
    expect(heatingSupply(20_000, null)).toBe(20_000)
  })

  it("is null for COP = 1", () => {
    expect(heatingSupply(10_000, 1)).toBeNull()
  })
})
