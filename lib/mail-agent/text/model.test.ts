// @vitest-environment node
import { describe, expect, it } from "vitest"
import { addUsage, textCost } from "./model"

describe("textCost", () => {
  it("prices Haiku at $0.10 in and $0.50 out per million tokens, in micro-dollars", () => {
    expect(textCost({ inputTokens: 6000, outputTokens: 800 })).toBe(1000)
    expect(textCost({ inputTokens: 0, outputTokens: 0 })).toBe(0)
  })

  it("uses the long-prompt price above 100K input tokens", () => {
    expect(textCost({ inputTokens: 200_000, outputTokens: 1000 })).toBe(102_500)
  })

  it("adds usage", () => {
    expect(addUsage({ inputTokens: 1, outputTokens: 2 }, { inputTokens: 3, outputTokens: 4 })).toEqual({ inputTokens: 4, outputTokens: 6 })
  })
})
