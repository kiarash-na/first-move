// @vitest-environment node
import { describe, expect, it } from "vitest"
import { totalCoolingDemand } from "./eq-3-02d-total-cooling-demand"

describe("EQ-3.2d total cooling demand", () => {
  it("sums the cooling demand of all cells (OQ-07)", () => {
    // 10 + 20 + 0.5 = 30.5 kWh/a
    expect(totalCoolingDemand([10, 20, 0.5])).toBe(30.5)
    expect(totalCoolingDemand([])).toBe(0)
  })
})
