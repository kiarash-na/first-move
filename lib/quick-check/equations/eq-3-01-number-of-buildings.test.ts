// @vitest-environment node
import { describe, expect, it } from "vitest"
import { numberOfBuildings } from "./eq-3-01-number-of-buildings"

describe("EQ-3.1 number of buildings", () => {
  it("multiplies the total by the share", () => {
    // 20 buildings · 25 % (0.25) = 5
    expect(numberOfBuildings(20, 0.25)).toBe(5)
  })

  it("stays fractional (OQ-01)", () => {
    // 7 · 0.5 = 3.5, not rounded
    expect(numberOfBuildings(7, 0.5)).toBe(3.5)
    expect(numberOfBuildings(7, 0)).toBe(0)
  })
})
