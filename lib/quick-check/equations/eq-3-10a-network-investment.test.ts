// @vitest-environment node
import { describe, expect, it } from "vitest"
import { networkInvestment } from "./eq-3-10a-network-investment"

describe("EQ-3.10a network investment", () => {
  it("multiplies the cost per metre by the length", () => {
    // 500 €/m · 300 m = 150 000 €
    expect(networkInvestment(500, 300)).toBe(150_000)
  })
})
