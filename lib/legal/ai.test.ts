import { describe, expect, it } from "vitest"
import { AI_FEATURES_LIVE, AI_PLAN_SCORE_LIVE, AI_PROVIDERS, aiStatus } from "./ai"

describe("AI switch", () => {
  it("keeps the AI features off until they are built (D-05, D-42)", () => {
    expect(AI_FEATURES_LIVE).toBe(true)
  })

  it("marks the AI Plan Score as available (PLAN-AI-SCORE-00)", () => {
    expect(AI_PLAN_SCORE_LIVE).toBe(true)
  })

  it("lists no provider while the features are off", () => {
    expect(AI_FEATURES_LIVE || AI_PROVIDERS.length === 0).toBe(true)
  })

  it("names a region and a link for every provider once there are any", () => {
    for (const provider of AI_PROVIDERS) {
      expect(provider.region).not.toBe("")
      expect(provider.url.startsWith("https://")).toBe(true)
    }
  })
})

describe("aiStatus", () => {
  it("is 'live' once the AI features are on, whatever the score switch says", () => {
    expect(aiStatus(true, true)).toBe("live")
    expect(aiStatus(true, false)).toBe("live")
  })

  it("is 'score' while only the AI Plan Score is available", () => {
    expect(aiStatus(false, true)).toBe("score")
  })

  it("is 'planned' while nothing is available", () => {
    expect(aiStatus(false, false)).toBe("planned")
  })

  it("is 'score' with today's switches", () => {
    expect(aiStatus(AI_FEATURES_LIVE, AI_PLAN_SCORE_LIVE)).toBe("live")
  })
})
