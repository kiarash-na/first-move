import { describe, expect, it } from "vitest"
import { DEFAULT_OPENROUTER_MODEL, isOpenRouterModelId, OPENROUTER_MODELS } from "./models"

describe("OpenRouter models", () => {
  it("defaults to the Auto Router and lists valid, unique ids", () => {
    expect(DEFAULT_OPENROUTER_MODEL).toBe("openrouter/auto")
    expect(new Set(OPENROUTER_MODELS.map((model) => model.id)).size).toBe(OPENROUTER_MODELS.length)
    for (const model of OPENROUTER_MODELS) expect(isOpenRouterModelId(model.id), model.id).toBe(true)
  })

  it("accepts OpenRouter ids with a variant and refuses anything else", () => {
    expect(isOpenRouterModelId("meta-llama/llama-4-maverick:free")).toBe(true)
    expect(isOpenRouterModelId("https://evil.example/x")).toBe(false)
    expect(isOpenRouterModelId("claude")).toBe(false)
    expect(isOpenRouterModelId("anthropic/<script>")).toBe(false)
  })
})
