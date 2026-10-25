import { describe, expect, it } from "vitest"
import { isProvider, PROVIDERS } from "./types"

describe("assistant providers", () => {
  it("are the Vercel AI Gateway and OpenRouter, and nothing else", () => {
    expect(PROVIDERS).toEqual(["gateway", "openrouter"])
    expect(isProvider("gateway")).toBe(true)
    expect(isProvider("openrouter")).toBe(true)
    expect(isProvider("anthropic")).toBe(false)
    expect(isProvider(undefined)).toBe(false)
  })
})
