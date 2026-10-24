import { describe, expect, it } from "vitest"
import { AI_FEATURES_LIVE, AI_PROVIDERS } from "./ai"

describe("AI switch", () => {
  it("keeps the AI features off until they are built (D-05, D-42)", () => {
    expect(AI_FEATURES_LIVE).toBe(false)
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
