// @vitest-environment node
import { describe, expect, it } from "vitest"
import { economicRatio } from "./economic-ratio"

describe("economic ratio (OQ-21)", () => {
  it("divides the revenue by the annual costs", () => {
    // 30 000 / (20 000 + 5 000 + 5 000) = 1
    expect(economicRatio(30_000, 20_000, 5_000, 5_000)).toBe(1)
    // 31 800 / (16 250 + 900 + 6 500) = 31 800 / 23 650 = 1.344609…
    expect(economicRatio(31_800, 16_250, 900, 6_500)).toBeCloseTo(1.344609, 6)
  })

  it("is null when there are no annual costs", () => {
    expect(economicRatio(1_000, 0, 0, 0)).toBeNull()
  })
})
