import { describe, expect, it } from "vitest"
import { concentration, expectedLevel, levelProbabilities, levelVariance, pointMass } from "./distribution"

describe("level distributions", () => {
  it("reads Jev's map and renormalises it", () => {
    expect(levelProbabilities({ "0": 0.1, "1": 0.1, "2": 0.2, "3": 0.4, "4": 0.2 })).toEqual([0.1, 0.1, 0.2, 0.4, 0.2])
    expect(levelProbabilities({ "2": 2, "3": 2 })).toEqual([0, 0, 0.5, 0.5, 0])
    expect(levelProbabilities(undefined)).toBeNull()
    expect(levelProbabilities({ "1": 0 })).toBeNull()
  })

  it("gives the expected level, its variance and how concentrated it is", () => {
    expect(expectedLevel([0, 0, 0.5, 0.5, 0])).toBe(2.5)
    expect(levelVariance([0, 0, 0.5, 0.5, 0])).toBe(0.25)
    expect(levelVariance(pointMass(3))).toBe(0)
    expect(concentration(pointMass(3))).toBe(1)
    expect(concentration([0.2, 0.2, 0.2, 0.2, 0.2])).toBeCloseTo(0, 10)
    expect(pointMass(9)).toEqual([0, 0, 0, 0, 1])
  })
})
