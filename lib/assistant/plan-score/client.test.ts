import { describe, expect, it } from "vitest"
import { DECISION_PROVIDER_OPTIONS } from "@/lib/ai/plan-score/decide-turn"
import { OPENROUTER_PROVIDER_OPTIONS } from "../openrouter/client"
import { OPENROUTER_DECISION_MODEL_ID } from "../openrouter/decision-model"
import { scoreClient } from "./client"

describe("scoreClient", () => {
  it("serves the pinned Jev and the Gateway privacy options on the Gateway", () => {
    const client = scoreClient("gateway", "vck_test")
    expect(client.decisionModel().modelId).toBe("typesafe-ai/jev-1.14.0")
    expect(client.decisionProviderOptions).toEqual(DECISION_PROVIDER_OPTIONS)
    expect(client.textProviderOptions("anthropic/claude-haiku-5.5")).toEqual({ gateway: { zeroDataRetention: true, disallowPromptTraining: true } })
    expect(client.textProviderOptions("creator/custom")).toEqual({ gateway: { disallowPromptTraining: true } })
  })

  it("serves the Jev Router adapter and data-collection deny on OpenRouter", () => {
    const client = scoreClient("openrouter", "sk-or-v1-test")
    const decision = client.decisionModel()
    expect(decision.provider).toBe("openrouter")
    expect(decision.modelId).toBe(OPENROUTER_DECISION_MODEL_ID)
    expect(client.decisionProviderOptions).toEqual(OPENROUTER_PROVIDER_OPTIONS)
    expect(client.textProviderOptions("openrouter/auto")).toEqual(OPENROUTER_PROVIDER_OPTIONS)
  })
})
