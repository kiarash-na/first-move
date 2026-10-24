// @vitest-environment node
import { describe, expect, it } from "vitest"
import { totalSupplyInvestment } from "./eq-3-10c-supply-investment-total"

describe("EQ-3.10c total supply investment", () => {
  it("sums the investment of every source", () => {
    // 18 750 + 6 250 = 25 000 €
    expect(totalSupplyInvestment([18_750, 6_250])).toBe(25_000)
    expect(totalSupplyInvestment([])).toBe(0)
  })
})
