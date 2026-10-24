// @vitest-environment node
import { describe, expect, it } from "vitest"
import { coolingToHeatingRatio, dominantDemand } from "./eq-3-07-cooling-to-heating-ratio"

describe("EQ-3.7 cooling-to-heating ratio (OQ-12)", () => {
  it("divides the smaller demand by the larger one", () => {
    // min(30, 120) / max(30, 120) = 30 / 120 = 0.25
    expect(coolingToHeatingRatio(30, 120)).toBe(0.25)
    // cooling dominant: min(120, 30) / max(120, 30) = 0.25, still 0–1
    expect(coolingToHeatingRatio(120, 30)).toBe(0.25)
    expect(coolingToHeatingRatio(80, 80)).toBe(1)
  })

  it("is 0 when one demand is 0 and null when both are", () => {
    expect(coolingToHeatingRatio(0, 120)).toBe(0)
    expect(coolingToHeatingRatio(0, 0)).toBeNull()
  })

  it("names the dominant demand", () => {
    expect(dominantDemand(30, 120)).toBe("heating")
    expect(dominantDemand(120, 30)).toBe("cooling")
    expect(dominantDemand(80, 80)).toBe("equal")
    expect(dominantDemand(0, 0)).toBeNull()
  })
})
