// @vitest-environment node
import { describe, expect, it } from "vitest"
import { isEnabled, readMailAgentEnv } from "./env"

const key = (fill: string) => Buffer.alloc(32, fill).toString("base64")

const COMPLETE = {
  SITE_URL: "https://firstmove.energy/",
  EMAIL_AGENT_ENABLED: "true",
  EMAIL_AGENT_ADDRESS: "Agent@mail.firstmove.energy",
  EMAIL_AGENT_ADMIN_ADDRESS: "owner@example.com",
  RESEND_API_KEY: "re_test_123",
  RESEND_WEBHOOK_SECRET: "whsec_c2VjcmV0",
  RESEND_AGENT_INBOX_ID: "inbox_1",
  AI_GATEWAY_API_KEY: "gateway-key",
  KV_REST_API_URL: "https://eu1-example.upstash.io",
  KV_REST_API_TOKEN: "token",
  EMAIL_AGENT_HASH_SECRET: key("a"),
  EMAIL_AGENT_STATE_KEY: key("b"),
  EMAIL_CONFIRM_SECRET: key("c"),
}

describe("readMailAgentEnv", () => {
  it("is ready when switched on and complete, with defaults for limits and models", () => {
    const env = readMailAgentEnv(COMPLETE)
    expect(env.status).toBe("ready")
    if (env.status !== "ready") return
    expect(env.config.siteUrl).toBe("https://firstmove.energy")
    expect(env.config.addresses.agent).toBe("agent@mail.firstmove.energy")
    expect(env.config.limits).toEqual({ dailyBudgetUsd: 2, senderPerHour: 10, senderPerDay: 30, globalPerDay: 500 })
    expect(env.config.gateway).toMatchObject({ decisionModel: "typesafe-ai/jev-1.14.0", textModel: "anthropic/claude-haiku-5.5" })
    expect(env.config.secrets.hash).toHaveLength(32)
    expect(env.config.secrets.hash).not.toEqual(env.config.secrets.state)
  })

  it("accepts the Upstash names the Marketplace may inject", () => {
    const { KV_REST_API_URL, KV_REST_API_TOKEN, ...rest } = COMPLETE
    const env = readMailAgentEnv({ ...rest, UPSTASH_REDIS_REST_URL: KV_REST_API_URL, UPSTASH_REDIS_REST_TOKEN: KV_REST_API_TOKEN })
    expect(env.status).toBe("ready")
  })

  it("is off and lists missing names when incomplete", () => {
    const { RESEND_API_KEY, EMAIL_CONFIRM_SECRET, ...rest } = COMPLETE
    expect(RESEND_API_KEY && EMAIL_CONFIRM_SECRET).toBeTruthy()
    expect(readMailAgentEnv({ ...rest, KV_REST_API_TOKEN: "  " })).toEqual({
      status: "off",
      enabled: true,
      missing: ["RESEND_API_KEY", "KV_REST_API_TOKEN", "EMAIL_CONFIRM_SECRET"],
      invalid: [],
    })
  })

  it.each([
    ["a secret of 31 bytes", { EMAIL_AGENT_HASH_SECRET: Buffer.alloc(31, 1).toString("base64") }, "EMAIL_AGENT_HASH_SECRET"],
    ["a secret of 33 bytes", { EMAIL_AGENT_STATE_KEY: Buffer.alloc(33, 1).toString("base64") }, "EMAIL_AGENT_STATE_KEY"],
    ["a secret that is not base64", { EMAIL_CONFIRM_SECRET: "x".repeat(43) + "!" }, "EMAIL_CONFIRM_SECRET"],
    ["a bad address", { EMAIL_AGENT_ADMIN_ADDRESS: "owner" }, "EMAIL_AGENT_ADMIN_ADDRESS"],
    ["a Resend key of another kind", { RESEND_API_KEY: "sk_123" }, "RESEND_API_KEY"],
    ["a plain-http store", { KV_REST_API_URL: "http://eu1-example.upstash.io" }, "KV_REST_API_URL"],
    ["a negative limit", { EMAIL_AGENT_SENDER_PER_DAY: "-1" }, "EMAIL_AGENT_SENDER_PER_DAY"],
    ["a model without provider", { EMAIL_AGENT_TEXT_MODEL: "claude-haiku-5-5" }, "EMAIL_AGENT_TEXT_MODEL"],
  ])("is off on %s, naming the variable and never its value", (_, change, name) => {
    const env = readMailAgentEnv({ ...COMPLETE, ...change })
    expect(env).toEqual({ status: "off", enabled: true, missing: [], invalid: [name] })
    expect(JSON.stringify(env)).not.toContain(Object.values(change)[0])
  })

  it("stays off unless switched on, but still reports what is missing", () => {
    expect(readMailAgentEnv({ ...COMPLETE, EMAIL_AGENT_ENABLED: "false" })).toEqual({ status: "off", enabled: false, missing: [], invalid: [] })
    expect(readMailAgentEnv({})).toMatchObject({ status: "off", enabled: false, missing: expect.arrayContaining(["SITE_URL", "RESEND_API_KEY"]) })
  })
})

describe("isEnabled", () => {
  it.each([
    ["true", true],
    ["TRUE ", true],
    ["1", true],
    ["false", false],
    ["yes", false],
    ["", false],
    [undefined, false],
  ])("%s → %s", (value, expected) => {
    expect(isEnabled({ EMAIL_AGENT_ENABLED: value })).toBe(expected)
  })
})
