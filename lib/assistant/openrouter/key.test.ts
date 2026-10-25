import { describe, expect, it } from "vitest"
import { isPlausibleOpenRouterKey } from "./key"

describe("OpenRouter key format", () => {
  it("accepts sk-or- keys and nothing else", () => {
    expect(isPlausibleOpenRouterKey(`sk-or-v1-${"a1".repeat(32)}`)).toBe(true)
    expect(isPlausibleOpenRouterKey(`  sk-or-v1-${"a1".repeat(32)}  `)).toBe(true)
    expect(isPlausibleOpenRouterKey("sk-or-short")).toBe(false)
    expect(isPlausibleOpenRouterKey(`vck_${"a1".repeat(20)}`)).toBe(false)
    expect(isPlausibleOpenRouterKey(`sk-or-v1-${"a1".repeat(10)} ${"b2".repeat(10)}`)).toBe(false)
  })
})
