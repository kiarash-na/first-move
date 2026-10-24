// @vitest-environment node
import { describe, expect, it } from "vitest"
import { totalNetLength } from "./eq-3-04b-total-net-length"

describe("EQ-3.4b total net length", () => {
  it("multiplies the specific length by the area in hectares", () => {
    // 150 m/ha · 20 000 m² / 10⁴ = 150 · 2 = 300 m
    expect(totalNetLength(150, 20_000)).toBe(300)
    // 85.61 m/ha · 5 000 m² / 10⁴ = 85.61 · 0.5 = 42.805 m
    expect(totalNetLength(85.61, 5_000)).toBeCloseTo(42.805, 9)
  })
})
