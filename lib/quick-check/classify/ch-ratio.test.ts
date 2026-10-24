// @vitest-environment node
import { describe, expect, it } from "vitest"
import { classifyChRatio } from "./ch-ratio"

describe("TBL-10 CH ratio classes (OQ-20)", () => {
  it.each([
    [1, "balanced"],
    [0.8, "balanced"], // the shared boundary 0.8 belongs to the upper class
    [0.7999, "partially_balanced"],
    [0.3, "partially_balanced"],
    [0.2999, "unbalanced"],
    [0, "unbalanced"],
  ] as const)("%s → %s", (ratio, expected) => {
    expect(classifyChRatio(ratio)).toBe(expected)
  })

  it("is null when not applicable", () => {
    expect(classifyChRatio(null)).toBeNull()
  })
})
