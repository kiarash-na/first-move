// @vitest-environment node
import { describe, expect, it } from "vitest"
import { classifyBuildingDensity, densityCategory } from "./building-density"

describe("TBL-8 building density classes (OQ-20)", () => {
  it.each([
    [45, "high"],
    [30.01, "high"],
    [30, "medium"], // "Above 30" is exclusive
    [10, "medium"],
    [9.99, "low"],
    [0.5, "low"],
  ] as const)("%s buildings/ha → %s", (density, expected) => {
    expect(classifyBuildingDensity(density)).toBe(expected)
  })

  it("derives the density category (OQ-04)", () => {
    expect(densityCategory("low")).toBe("rural")
    expect(densityCategory("medium")).toBe("sub_urban")
    expect(densityCategory("high")).toBe("urban")
  })
})
