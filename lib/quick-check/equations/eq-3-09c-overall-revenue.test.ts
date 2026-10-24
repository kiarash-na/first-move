// @vitest-environment node
import { describe, expect, it } from "vitest"
import { connectionFeeRevenue, overallRevenue } from "./eq-3-09c-overall-revenue"

describe("EQ-3.9c overall revenue", () => {
  it("adds heating, cooling and the annualized connection fees", () => {
    // 24 000 + 6 800 + 1 000 €/building · 10 buildings · 0.1 = 24 000 + 6 800 + 1 000 = 31 800 €/a
    expect(overallRevenue(24_000, 6_800, 1_000, 10, 0.1)).toBeCloseTo(31_800, 9)
  })

  it("exposes the connection-fee term", () => {
    // 1 000 · 4 · 0.05 = 200 €/a
    expect(connectionFeeRevenue(1_000, 4, 0.05)).toBeCloseTo(200, 9)
  })
})
