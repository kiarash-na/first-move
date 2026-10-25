import { describe, expect, it } from "vitest"
import { assistantModel, assistantProviderOptions } from "./model"

describe("assistant model per provider", () => {
  it("builds the Gateway model with the shared key and the OpenRouter chat model", () => {
    const gateway = assistantModel("gateway", "vck_test_key_abcdefghijklmnop1234", "anthropic/claude-sonnet-5.5")
    const openrouter = assistantModel("openrouter", `sk-or-v1-${"ef".repeat(32)}`, "openrouter/auto")
    expect(typeof gateway).toBe("object")
    expect(gateway).toMatchObject({ modelId: "anthropic/claude-sonnet-5.5" })
    expect(openrouter).toMatchObject({ modelId: "openrouter/auto", provider: "openrouter.chat" })
  })

  it("asks each provider to keep the data out of training", () => {
    expect(assistantProviderOptions("gateway", "anthropic/claude-sonnet-5.5")).toEqual({ gateway: { zeroDataRetention: true, disallowPromptTraining: true } })
    expect(assistantProviderOptions("gateway", "meta/llama-4-maverick")).toEqual({ gateway: { disallowPromptTraining: true } })
    expect(assistantProviderOptions("openrouter", "openrouter/auto")).toEqual({ openrouter: { provider: { data_collection: "deny" } } })
  })
})
