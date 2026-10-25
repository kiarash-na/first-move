import { describe, expect, it } from "vitest"
import { DEFAULT_TEXT_MODEL, isModelId, TEXT_MODELS, textProviderOptions } from "./models"

describe("text models (D-71)", () => {
  it("has a valid, unique catalogue with Sonnet 5.5 as the default", () => {
    expect(DEFAULT_TEXT_MODEL).toBe("anthropic/claude-sonnet-5.5")
    expect(new Set(TEXT_MODELS.map((model) => model.id)).size).toBe(TEXT_MODELS.length)
    for (const model of TEXT_MODELS) expect(isModelId(model.id), model.id).toBe(true)
  })

  it("accepts any Gateway model id and nothing else", () => {
    expect(isModelId("meta/llama-4-maverick")).toBe(true)
    expect(isModelId("anthropic/claude-sonnet-5.5 ")).toBe(true)
    expect(isModelId("https://evil.example/x")).toBe(false)
    expect(isModelId("claude")).toBe(false)
  })

  it("asks for zero data retention only where the catalogue lists it, and never for training", () => {
    expect(textProviderOptions("anthropic/claude-haiku-5.5")).toEqual({ gateway: { zeroDataRetention: true, disallowPromptTraining: true } })
    expect(textProviderOptions("meta/llama-4-maverick")).toEqual({ gateway: { disallowPromptTraining: true } })
  })
})
