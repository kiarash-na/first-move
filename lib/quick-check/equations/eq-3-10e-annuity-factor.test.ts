// @vitest-environment node
import { describe, expect, it } from "vitest"
import { annuityFactor } from "./eq-3-10e-annuity-factor"

describe("EQ-3.10e annuity factor", () => {
  it("matches a hand value", () => {
    // i = 10 %, p = 2: 1.1² = 1.21 → 1.21 · 0.1 / (1.21 − 1) = 0.121 / 0.21 = 0.576190…
    expect(annuityFactor(0.1, 2)).toBeCloseTo(0.576190476, 9)
  })

  it("gives the TBL-6 default factor (3 %, 20 a)", () => {
    // 1.03²⁰ = 1.806111 → 1.806111 · 0.03 / 0.806111 = 0.0672157
    expect(annuityFactor(0.03, 20)).toBeCloseTo(0.0672157, 7)
  })

  it("uses the limit 1/p at an interest rate of 0", () => {
    // 1 / 20 = 0.05
    expect(annuityFactor(0, 20)).toBe(0.05)
  })

  it("is null for a period of 0", () => {
    expect(annuityFactor(0.03, 0)).toBeNull()
    expect(annuityFactor(0, 0)).toBeNull()
  })
})
