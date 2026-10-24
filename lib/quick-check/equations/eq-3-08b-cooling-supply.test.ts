// @vitest-environment node
import { describe, expect, it } from "vitest"
import { coolingSupply } from "./eq-3-08b-cooling-supply"

describe("EQ-3.8b cooling supply", () => {
  it("multiplies the capacity by COP / (COP + 1)", () => {
    // 10 000 kWh/a · 4 / (4 + 1) = 8 000 kWh/a
    expect(coolingSupply(10_000, 4)).toBe(8_000)
    // ground water medium: 50 000 · 5 / 6 = 41 666.67 kWh/a
    expect(coolingSupply(50_000, 5)).toBeCloseTo(41_666.666667, 5)
  })

  it("is 0 for a source without cooling capacity (OQ-13)", () => {
    expect(coolingSupply(0, null)).toBe(0)
  })

  it("is null for COP = −1", () => {
    expect(coolingSupply(10_000, -1)).toBeNull()
  })
})
