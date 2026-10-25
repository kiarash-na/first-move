// @vitest-environment node
import { describe, expect, it } from "vitest"
import { cleanModelText, forbiddenModelText } from "./model-text"

const policy = {
  siteUrl: "https://firstmove.energy",
  canary: "fm-0123456789abcdef",
  instructions: "You answer questions about First Move by email, only from the documentation excerpts given below and nothing else.",
  maxChars: 120,
}

describe("cleanModelText", () => {
  it("keeps site links and defangs others", () => {
    expect(cleanModelText("See https://firstmove.energy/en/docs and https://evil.example/x", policy)).toBe("See https://firstmove.energy/en/docs and evil[.]example/x")
  })

  it("refuses text that leaks the canary or the instructions", () => {
    expect(cleanModelText("Marker fm-0123456789abcdef", policy)).toBeNull()
    expect(cleanModelText(`My rules: ${policy.instructions}`, { ...policy, maxChars: 500 })).toBeNull()
  })

  it("refuses an address other than ours, keeps ours", () => {
    expect(cleanModelText("Write to boss@evil.example for details.", policy)).toBeNull()
    expect(cleanModelText("Write to human@mail.firstmove.energy.", policy)).toBe("Write to human@mail.firstmove.energy.")
  })

  it("forbids hidden characters inside the canary or a foreign address", () => {
    expect(forbiddenModelText("fm-0123\u200b456789abcdef", policy)).toBe(true)
    expect(forbiddenModelText("boss@\u200bevil.example", policy)).toBe(true)
    expect(forbiddenModelText("Sonnenhof estate, 42 buildings", policy)).toBe(false)
  })

  it("cuts long text and drops empty text", () => {
    expect([...cleanModelText("word ".repeat(100), policy)!].length).toBeLessThanOrEqual(120)
    expect(cleanModelText("  \u200b ", policy)).toBeNull()
  })
})
