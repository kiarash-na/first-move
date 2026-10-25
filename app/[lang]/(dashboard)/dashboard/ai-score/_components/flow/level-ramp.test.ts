import { describe, expect, it } from "vitest"
import { LEVEL_RAMP_CLASS, LEVEL_STEPS, levelFill, levelId, levelStep } from "./level-ramp"

describe("level ramp", () => {
  it("defines five steps for both themes from the design tokens only", () => {
    for (const step of LEVEL_STEPS) {
      expect(LEVEL_RAMP_CLASS).toContain(`[--level-${step}:`)
      expect(LEVEL_RAMP_CLASS).toContain(`dark:[--level-${step}:`)
    }
    const colours = LEVEL_RAMP_CLASS.match(/var\(--[a-z0-9-]+\)/g) ?? []
    expect(new Set(colours)).toEqual(new Set(["var(--accent-hot)", "var(--card)", "var(--ink-950)"]))
    expect(LEVEL_RAMP_CLASS).not.toMatch(/#|oklch|rgb/)
  })

  it("rounds an expected level to its step and name", () => {
    expect(levelStep(2.4)).toBe(2)
    expect(levelStep(2.5)).toBe(3)
    expect(levelStep(-1)).toBe(0)
    expect(levelStep(7)).toBe(4)
    expect(levelFill(3.6)).toBe("var(--level-4)")
    expect(levelId(0.2)).toBe("missing")
    expect(levelId(2.4)).toBe("specific")
  })
})
