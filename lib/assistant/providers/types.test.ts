import { describe, expect, it } from "vitest"
import { isProvider, PROVIDERS } from "./types"

describe("assistant providers", () => {
  it("are OpenRouter (the default) and the Vercel AI Gateway, and nothing else", () => {
    expect(PROVIDERS).toEqual(["openrouter", "gateway"])
    expect(isProvider("gateway")).toBe(true)
    expect(isProvider("openrouter")).toBe(true)
    expect(isProvider("anthropic")).toBe(false)
    expect(isProvider(undefined)).toBe(false)
  })
})
