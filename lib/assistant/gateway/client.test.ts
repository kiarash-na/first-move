import { experimental_decide } from "ai"
import { describe, expect, it, vi } from "vitest"
import { gatewayClient } from "./client"

describe("gatewayClient", () => {
  it("calls the Gateway directly with the user's key and asks Jev 1.14.0", async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify({ answers: { q: { type: "boolean", probability: 0.9 } }, usage: { inputTokens: 12 } }), { headers: { "content-type": "application/json" } }))
    const client = gatewayClient("vck_test_key_1234567890abcdef", fetch as unknown as typeof globalThis.fetch)
    const result = await experimental_decide({ model: client.decisionModel(), state: { plan: [] }, questions: { q: { type: "boolean", instructions: "Q?" } }, maxRetries: 0 })
    expect(result.answers.q).toEqual({ type: "boolean", probability: 0.9 })
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe("https://ai-gateway.vercel.sh/v4/ai/decision-model")
    const headers = new Headers(init.headers)
    expect(headers.get("authorization")).toBe("Bearer vck_test_key_1234567890abcdef")
    expect(headers.get("ai-model-id")).toBe("typesafe-ai/jev-1.14.0")
    // Not listed in the Gateway's CORS rules, so never sent from the browser.
    expect(headers.has("user-agent")).toBe(false)
  })

  it("reads the credits to check a key", async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify({ balance: "4.20", total_used: "0.80" }), { headers: { "content-type": "application/json" } }))
    const credits = await gatewayClient("vck_test_key_1234567890abcdef", fetch as unknown as typeof globalThis.fetch).credits()
    expect(credits.balance).toBe("4.20")
    expect(String((fetch.mock.calls[0] as unknown as [string])[0])).toBe("https://ai-gateway.vercel.sh/v1/credits")
  })
})
