// @vitest-environment node
import { describe, expect, it } from "vitest"
import { heatPumpInvestment, overallInvestment } from "./eq-3-10d-overall-investment"

describe("EQ-3.10d overall investment (OQ-17)", () => {
  it("adds heat pumps, network and total supply investment once", () => {
    // 15 000 € · 10 + 150 000 + 25 000 = 150 000 + 150 000 + 25 000 = 325 000 €
    expect(overallInvestment(15_000, 10, 150_000, 25_000)).toBe(325_000)
  })

  it("does not add C_i a second time", () => {
    // with C_i (18 750) added again the source formula would give 343 750 €
    expect(overallInvestment(15_000, 10, 150_000, 25_000)).not.toBe(343_750)
  })

  it("exposes the heat-pump term", () => {
    // 15 000 · 4 = 60 000 €
    expect(heatPumpInvestment(15_000, 4)).toBe(60_000)
  })
})
