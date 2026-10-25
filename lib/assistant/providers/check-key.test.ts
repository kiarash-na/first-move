import { describe, expect, it, vi } from "vitest"
import { assistantErrorCode } from "./errors"
import { checkKey } from "./check-key"

const json = (body: unknown, status = 200) => vi.fn(async () => Response.json(body, { status })) as unknown as typeof globalThis.fetch

describe("checkKey", () => {
  it("reads the Gateway balance", async () => {
    expect(await checkKey("gateway", "vck_test_key_abcdefghijklmnop1234", json({ balance: "4.20", total_used: "0.80" }))).toEqual({ provider: "gateway", balance: 4.2 })
  })

  it("reads the OpenRouter limit", async () => {
    const check = await checkKey("openrouter", `sk-or-v1-${"cd".repeat(32)}`, json({ data: { limit: 5, limit_remaining: 5, limit_reset: null, usage: 0 } }))
    expect(check).toMatchObject({ provider: "openrouter", info: { limit: 5 } })
  })

  it("throws what the error mapping understands", async () => {
    const error = await checkKey("openrouter", `sk-or-v1-${"cd".repeat(32)}`, json({ error: { code: 401 } }, 401)).catch((caught: unknown) => caught)
    expect(assistantErrorCode(error)).toBe("key")
  })
})
