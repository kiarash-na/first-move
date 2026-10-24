// @vitest-environment node
import { describe, expect, it } from "vitest"
import { totalHeatingDemand } from "./eq-3-02c-total-heating-demand"

describe("EQ-3.2c total heating demand", () => {
  it("sums the demand of all cells", () => {
    // 100 + 250.5 + 0 = 350.5 kWh/a
    expect(totalHeatingDemand([100, 250.5, 0])).toBe(350.5)
  })

  it("is 0 without cells", () => {
    expect(totalHeatingDemand([])).toBe(0)
  })
})
