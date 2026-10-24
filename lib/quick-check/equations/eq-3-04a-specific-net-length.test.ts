// @vitest-environment node
import { describe, expect, it } from "vitest"
import { specificNetLength } from "./eq-3-04a-specific-net-length"

describe("EQ-3.4a specific net length", () => {
  it("is 171.22 / 9.817 at a density of 0", () => {
    // e⁰ = 1 → 171.22 / (1 + 8.817) = 171.22 / 9.817 ≈ 17.4412 m/ha
    expect(specificNetLength(0)).toBeCloseTo(17.4412, 4)
  })

  it("is half the maximum where 8.817 · e^(−0.549 N) = 1", () => {
    // N = ln(8.817) / 0.549 → 171.22 / (1 + 1) = 85.61 m/ha
    expect(specificNetLength(Math.log(8.817) / 0.549)).toBeCloseTo(85.61, 9)
  })

  it("approaches 171.22 m/ha for dense areas", () => {
    // e^(−54.9) ≈ 1.4e-24 → 171.22 / 1 = 171.22
    expect(specificNetLength(100)).toBeCloseTo(171.22, 9)
  })

  it("matches a hand value at 12.5 buildings/ha", () => {
    // e^(−6.8625) = 0.00104629 → 171.22 / (1 + 0.00922518) = 169.6549 m/ha
    expect(specificNetLength(12.5)).toBeCloseTo(169.6549, 3)
  })
})
