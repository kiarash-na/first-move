// @vitest-environment node
import { describe, expect, it } from "vitest"
import { supplyInvestment } from "./eq-3-10b-supply-investment-per-source"

describe("EQ-3.10b supply investment per source", () => {
  it("multiplies the specific cost by the heating supply", () => {
    // 1.5 €/(kWh/a) · 12 500 kWh/a = 18 750 €
    expect(supplyInvestment(1.5, 12_500)).toBe(18_750)
  })

  it("is 0 for ambient air, whose cost is assumed 0 (OQ-18)", () => {
    expect(supplyInvestment(0, 75_000)).toBe(0)
  })
})
