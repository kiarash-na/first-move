// @vitest-environment node
import { describe, expect, it } from "vitest"
import { annualHeatingDemand } from "./eq-3-02a-annual-heating-demand"

describe("EQ-3.2a annual heating demand", () => {
  it("multiplies buildings, demand per m² and floor area", () => {
    // 2 · 100 kWh/m² · 500 m² = 100 000 kWh/a
    expect(annualHeatingDemand(2, 100, 500)).toBe(100_000)
  })

  it("uses the TBL-1 and TBL-3 values of a cell", () => {
    // residential -1919: 1 · 124.4 · 547.5 = 62 200 + 5 909 = 68 109 kWh/a
    expect(annualHeatingDemand(1, 124.4, 547.5)).toBeCloseTo(68_109, 9)
  })

  it("is 0 for industry, whose dashes count as 0 (OQ-02)", () => {
    expect(annualHeatingDemand(3, 0, 0)).toBe(0)
  })
})
