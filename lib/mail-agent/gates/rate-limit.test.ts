// @vitest-environment node
import { describe, expect, it } from "vitest"
import { keys } from "../store/keys"
import { createMemoryStore } from "../store/memory-store"
import { rateLimitGate } from "./rate-limit"
import { testConfig, testContext } from "./test-utils/context"

describe("rateLimitGate", () => {
  it("limit a sender per hour, from the environment", async () => {
    const store = createMemoryStore()
    const context = testContext({ config: testConfig({ EMAIL_AGENT_SENDER_PER_HOUR: "2" }) }, store)
    expect(await rateLimitGate(context)).toEqual({ ok: true })
    expect(await rateLimitGate(context)).toEqual({ ok: true })
    expect(await rateLimitGate(context)).toEqual({ ok: false, reason: "rate-sender" })
    expect(await rateLimitGate({ ...context, sid: "sid-other" })).toEqual({ ok: true })
  })

  it("limit a domain to 100 a day, but not free mail", async () => {
    const store = createMemoryStore()
    for (let index = 0; index < 100; index++) expect((await rateLimitGate(testContext({ sid: `sid-${index}` }, store))).ok).toBe(true)
    expect(await rateLimitGate(testContext({ sid: "sid-101" }, store))).toEqual({ ok: false, reason: "rate-domain" })
    const gmail = testContext({ sid: "sid-g", domain: "gmail.com", domainSid: "domain-gmail" }, store)
    for (let index = 0; index < 101; index++) await store.incr(keys.rate("domain-day", "domain-gmail", Math.floor(gmail.now / 86_400_000)), 1e9)
    expect(await rateLimitGate(gmail)).toEqual({ ok: true })
  })

  it("limit all mail per day", async () => {
    const store = createMemoryStore()
    const config = testConfig({ EMAIL_AGENT_GLOBAL_PER_DAY: "1" })
    expect((await rateLimitGate(testContext({ config, sid: "a", domainSid: "da" }, store))).ok).toBe(true)
    expect(await rateLimitGate(testContext({ config, sid: "b", domainSid: "db" }, store))).toEqual({ ok: false, reason: "rate-global" })
  })
})
