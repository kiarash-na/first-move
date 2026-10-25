import { streamText } from "ai"
import { describe, expect, it, vi } from "vitest"
import { assistantProviderOptions } from "../providers/model"
import { OPENROUTER_API, openRouterClient } from "./client"
import { scriptedFetch, textStream } from "./test-utils/sse"

const KEY = `sk-or-v1-${"ab".repeat(32)}`

describe("openRouterClient", () => {
  it("streams a chat completion straight from OpenRouter with the user's key and asks for no data collection", async () => {
    const { fetch, calls } = scriptedFetch([() => textStream("Hello from OpenRouter")])
    const result = streamText({
      model: openRouterClient(KEY, fetch).chatModel("openrouter/auto"),
      prompt: "Hi",
      providerOptions: assistantProviderOptions("openrouter", "openrouter/auto"),
      maxRetries: 0,
    })
    expect(await result.text).toBe("Hello from OpenRouter")
    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe(`${OPENROUTER_API}/chat/completions`)
    const headers = new Headers(calls[0].init.headers)
    expect(headers.get("authorization")).toBe(`Bearer ${KEY}`)
    expect(headers.get("http-referer")).toBe("https://firstmove.energy")
    expect(headers.get("x-openrouter-title")).toBe("First Move")
    expect(calls[0].body).toMatchObject({ model: "openrouter/auto", stream: true, provider: { data_collection: "deny" } })
    // No sampling parameters are sent.
    expect(calls[0].body).not.toHaveProperty("temperature")
  })

  it("reads the key's credit limit and expiry", async () => {
    const fetch = vi.fn(async () =>
      Response.json({ data: { label: "sk-or-v1-ab…", limit: 10, limit_remaining: 7.5, limit_reset: "monthly", usage: 2.5, expires_at: "2026-12-31T23:59:59Z", is_free_tier: false } }),
    )
    const info = await openRouterClient(KEY, fetch as unknown as typeof globalThis.fetch).keyInfo()
    expect(info).toEqual({ limit: 10, limitRemaining: 7.5, limitReset: "monthly", usage: 2.5, expiresAt: "2026-12-31T23:59:59Z" })
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(`${OPENROUTER_API}/key`)
    expect(new Headers(init.headers).get("authorization")).toBe(`Bearer ${KEY}`)
  })

  it("says when a key has no limit and no expiry", async () => {
    const fetch = vi.fn(async () => Response.json({ data: { limit: null, limit_remaining: null, limit_reset: null, usage: 0 } }))
    expect(await openRouterClient(KEY, fetch as unknown as typeof globalThis.fetch).keyInfo()).toEqual({ limit: null, limitRemaining: null, limitReset: null, usage: 0, expiresAt: null })
  })

  it("fails with the status only, never the response body", async () => {
    const fetch = vi.fn(async () => Response.json({ error: { message: "User not found.", code: 401 } }, { status: 401 }))
    const error = await openRouterClient(KEY, fetch as unknown as typeof globalThis.fetch)
      .keyInfo()
      .catch((caught: unknown) => caught)
    expect(error).toMatchObject({ statusCode: 401 })
    expect(String(error)).not.toContain("User not found")
    expect(String(error)).not.toContain(KEY)
  })
})
