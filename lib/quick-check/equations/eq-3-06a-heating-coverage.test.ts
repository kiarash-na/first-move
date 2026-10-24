// @vitest-environment node
import { describe, expect, it } from "vitest"
import { heatingCoverage } from "./eq-3-06a-heating-coverage"

describe("EQ-3.6a heating coverage", () => {
  it("divides the supply by the demand", () => {
    // 90 / 100 = 0.9 (90 %)
    expect(heatingCoverage(90, 100)).toBe(0.9)
    // 250 / 100 = 2.5 (250 %)
    expect(heatingCoverage(250, 100)).toBe(2.5)
  })

  it("is null without heating demand (not relevant, OQ-22)", () => {
    expect(heatingCoverage(90, 0)).toBeNull()
  })
})
