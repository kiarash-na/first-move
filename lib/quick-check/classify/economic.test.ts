// @vitest-environment node
import { describe, expect, it } from "vitest"
import { classifyEconomic } from "./economic"

describe("economic assessment (OQ-21)", () => {
  it.each([
    [1.4, "favorable"],
    [1, "favorable"],
    [0.9999, "unclear"],
    [0.7, "unclear"],
    [0.6999, "clearly_unfavorable"],
    [0, "clearly_unfavorable"],
  ] as const)("E = %s → %s", (ratio, expected) => {
    expect(classifyEconomic(ratio)).toBe(expected)
  })

  it("is null when E cannot be computed", () => {
    expect(classifyEconomic(null)).toBeNull()
  })
})
