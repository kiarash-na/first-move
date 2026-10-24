// @vitest-environment node
import { describe, expect, it } from "vitest"
import { classifyCoverage, coversAtLeast90 } from "./coverage"

describe("TBL-7 coverage classes (OQ-20)", () => {
  it.each([
    [2.5, "feasible"],
    [1, "feasible"],
    [0.9999, "conditionally_feasible"],
    [0.9995, "conditionally_feasible"], // 99.95 %: no gap between 99.9 and 100 (OQ-20)
    [0.9, "conditionally_feasible"],
    [0.8999, "limited_feasibility"],
    [0.8995, "limited_feasibility"], // 89.95 %: no gap between 89.9 and 90
    [0.7, "limited_feasibility"],
    [0.6999, "not_feasible"],
    [0, "not_feasible"],
  ] as const)("%s → %s", (coverage, expected) => {
    expect(classifyCoverage(coverage)).toBe(expected)
  })

  it("is null for a demand that is not relevant", () => {
    expect(classifyCoverage(null)).toBeNull()
  })

  it("counts 90 % and more as the Promising criterion", () => {
    expect(coversAtLeast90("feasible")).toBe(true)
    expect(coversAtLeast90("conditionally_feasible")).toBe(true)
    expect(coversAtLeast90("limited_feasibility")).toBe(false)
    expect(coversAtLeast90("not_feasible")).toBe(false)
  })
})
