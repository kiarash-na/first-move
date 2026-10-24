// @vitest-environment node
import { describe, expect, it } from "vitest"
import { annualCoolingDemand } from "./eq-3-02b-annual-cooling-demand"

describe("EQ-3.2b annual cooling demand", () => {
  it("multiplies buildings, demand per m² and floor area", () => {
    // 2 · 10 kWh/m² · 500 m² = 10 000 kWh/a
    expect(annualCoolingDemand(2, 10, 500)).toBe(10_000)
  })

  it("uses the TBL-2 and TBL-3 values of a cell", () => {
    // residential 1991-2010: 4 · 8.5 · 408 = 34 · 408 = 13 872 kWh/a
    expect(annualCoolingDemand(4, 8.5, 408)).toBeCloseTo(13_872, 9)
  })
})
