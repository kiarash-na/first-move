// @vitest-environment node
import { describe, expect, it } from "vitest"
import type { ThresholdRule } from "./rules.config"
import { classifyByRule } from "./threshold"

const rule: ThresholdRule<"a" | "b" | "c"> = {
  bands: [
    { class: "a", min: 10, inclusive: false },
    { class: "b", min: 5, inclusive: true },
  ],
  below: "c",
}

describe("classifyByRule", () => {
  it("takes the first band reached, else the class below", () => {
    expect(classifyByRule(11, rule)).toBe("a")
    expect(classifyByRule(10, rule)).toBe("b")
    expect(classifyByRule(5, rule)).toBe("b")
    expect(classifyByRule(4.99, rule)).toBe("c")
    expect(classifyByRule(-1, rule)).toBe("c")
  })

  it("ignores float noise at a boundary", () => {
    // 0.7 · 10 / 1.4 is not exactly 5 in floating point
    expect(classifyByRule(4.999999999999999, rule)).toBe("b")
    expect(classifyByRule(10.000000000000002, rule)).toBe("b")
  })
})
