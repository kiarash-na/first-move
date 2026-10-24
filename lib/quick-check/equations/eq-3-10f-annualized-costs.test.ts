// @vitest-environment node
import { describe, expect, it } from "vitest"
import { annualizedCosts } from "./eq-3-10f-annualized-costs"

describe("EQ-3.10f annualized costs", () => {
  it("multiplies the investment by the annuity factor", () => {
    // 325 000 € · 0.05 = 16 250 €/a
    expect(annualizedCosts(325_000, 0.05)).toBe(16_250)
  })
})
