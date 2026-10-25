import { describe, expect, it } from "vitest"
import { TEXT_MODELS } from "../gateway/models"
import { ASSISTANT_MODELS, DEFAULT_MODEL, isModelIdFor } from "./models"
import { PROVIDERS } from "./types"

describe("assistant models per provider", () => {
  it("reuses the AI Plan Score catalogue for the Gateway", () => {
    expect(ASSISTANT_MODELS.gateway.map((model) => model.id)).toEqual(TEXT_MODELS.map((model) => model.id))
  })

  it("has a valid default in each catalogue", () => {
    for (const provider of PROVIDERS) {
      expect(ASSISTANT_MODELS[provider].some((model) => model.id === DEFAULT_MODEL[provider]), provider).toBe(true)
      for (const model of ASSISTANT_MODELS[provider]) expect(isModelIdFor[provider](model.id), model.id).toBe(true)
    }
  })
})
