import { describe, expect, it } from "vitest"
import { LEVEL_IDS, MAX_LEVEL } from "@/lib/ai/plan-score/scale"
import { displayScore } from "@/lib/business-plan"
import { clampPoints, nearestLevel, POINTS_PER_LEVEL, ROUNDING_STEP, toPoints } from "./display"

describe("result display helpers", () => {
  it("puts the top level at 100 points", () => {
    expect(POINTS_PER_LEVEL * MAX_LEVEL).toBe(100)
  })

  it("names an expected level after the nearest level", () => {
    expect(nearestLevel(0)).toBe(LEVEL_IDS[0])
    expect(nearestLevel(1.49)).toBe(LEVEL_IDS[1])
    expect(nearestLevel(1.5)).toBe(LEVEL_IDS[2])
    expect(nearestLevel(MAX_LEVEL)).toBe(LEVEL_IDS[MAX_LEVEL])
    expect(nearestLevel(-1)).toBe(LEVEL_IDS[0])
    expect(nearestLevel(9)).toBe(LEVEL_IDS[MAX_LEVEL])
  })

  it("reads the rounding step from displayScore", () => {
    expect(displayScore(ROUNDING_STEP, 0).score).toBe(ROUNDING_STEP)
    for (let points = 1; points < ROUNDING_STEP; points++) expect(displayScore(points, 0).score).not.toBe(points)
    for (let points = 0; points <= 100; points += 7) expect(displayScore(points, 0).score % ROUNDING_STEP).toBe(0)
  })

  it("converts and clamps points", () => {
    expect(toPoints(0.5)).toBe(50)
    expect(clampPoints(-3)).toBe(0)
    expect(clampPoints(104)).toBe(100)
    expect(clampPoints(42)).toBe(42)
  })
})
