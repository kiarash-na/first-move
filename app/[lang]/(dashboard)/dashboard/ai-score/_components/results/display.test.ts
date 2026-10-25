import { describe, expect, it } from "vitest"
import { LEVEL_IDS, MAX_LEVEL } from "@/lib/ai/plan-score/scale"
import { displayScore } from "@/lib/business-plan"
import { clampPoints, digitsBeside, MIN_BAND, nearestLevel, POINTS_PER_LEVEL, ROUNDING_STEP, toPoints } from "./display"

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

  it("reads the smallest band from displayScore", () => {
    expect(MIN_BAND).toBe(displayScore(0, 0).band)
    expect(displayScore(50, 0.1).band).toBe(MIN_BAND)
  })

  it("adds digits only where rounding would cross a threshold", () => {
    expect(digitsBeside(1.4, [2], 1, 3)).toBe(1)
    expect(digitsBeside(1.96, [2], 1, 3)).toBe(2)
    expect(digitsBeside(1.999, [2], 1, 3)).toBe(3)
    expect(digitsBeside(2, [2], 1, 3)).toBe(1)
    expect(digitsBeside(2.14, [2], 1, 3)).toBe(1)
    // Never shown on a threshold it is not on.
    expect(digitsBeside(2.04, [2], 1, 3)).toBe(2)
    expect(digitsBeside(0.85, [0.2, 0.8], 2, 4)).toBe(2)
    expect(digitsBeside(0.7953, [0.2, 0.8], 2, 4)).toBe(3)
    expect(digitsBeside(0.7999, [0.2, 0.8], 2, 4)).toBe(4)
    expect(digitsBeside(0.2001, [0.2, 0.8], 2, 4)).toBe(4)
    expect(digitsBeside(0.8, [0.2, 0.8], 2, 4)).toBe(2)
  })

  it("converts and clamps points", () => {
    expect(toPoints(0.5)).toBe(50)
    expect(clampPoints(-3)).toBe(0)
    expect(clampPoints(104)).toBe(100)
    expect(clampPoints(42)).toBe(42)
  })
})
