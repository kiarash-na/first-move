// @vitest-environment node
import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it, vi } from "vitest"
import { readMailAgentEnv } from "@/lib/mail-agent/env"
import { envNames, formatLines, OPTIONAL, runDoctor, WEBHOOK_EVENT } from "./mail-agent-doctor.mjs"

const example = readFileSync(path.resolve(__dirname, "../.env.example"), "utf8")
const key = (fill: number) => Buffer.alloc(32, fill).toString("base64")

const env: Record<string, string> = {
  SITE_URL: "https://firstmove.energy",
  EMAIL_AGENT_ENABLED: "false",
  EMAIL_AGENT_ADDRESS: "agent@mail.firstmove.energy",
  EMAIL_AGENT_ADMIN_ADDRESS: "owner@example.org",
  RESEND_API_KEY: "re_test_only",
  RESEND_WEBHOOK_SECRET: `whsec_${Buffer.alloc(24, 9).toString("base64")}`,
  RESEND_AGENT_INBOX_ID: "inbox-agent",
  AI_GATEWAY_API_KEY: "test-gateway-key",
  KV_REST_API_URL: "https://store.example.org",
  KV_REST_API_TOKEN: "test-token",
  EMAIL_AGENT_HASH_SECRET: key(1),
  EMAIL_AGENT_STATE_KEY: key(2),
  EMAIL_CONFIRM_SECRET: key(3),
}

type Setup = { agentActions?: string[]; hooks?: { endpoint: string; status: string; events: string[] }[]; tracking?: [boolean, boolean]; humanMissing?: boolean }

function fakeResend({ agentActions = [], hooks, tracking = [true, true], humanMissing = false }: Setup = {}) {
  const ok = <T>(data: T) => ({ data, error: null })
  const missing = { data: null, error: { name: "not_found", message: "x" } }
  const inboxes: Record<string, { id: string; email_address: string }> = {
    "inbox-agent": { id: "inbox-agent", email_address: "agent@mail.firstmove.energy" },
    ...(!humanMissing && { "human@mail.firstmove.energy": { id: "inbox-human", email_address: "human@mail.firstmove.energy" } }),
  }
  const calls: string[] = []
  const client = {
    inboxes: {
      get: async (idOrEmail: string) => (calls.push(`inbox ${idOrEmail}`), inboxes[idOrEmail] ? ok(inboxes[idOrEmail]) : missing),
      agent: { get: async ({ inboxId }: { inboxId: string }) => ok({ object: "inbox_agent", actions: inboxId === "inbox-agent" ? agentActions : [] }) },
    },
    webhooks: { list: async () => ok({ data: hooks ?? [{ endpoint: "https://firstmove.energy/api/mail/inbound", status: "enabled", events: [WEBHOOK_EVENT] }] }) },
    domains: {
      list: async () => ok({ data: [{ id: "dom-1", name: "mail.firstmove.energy" }] }),
      get: async () => ok({ open_tracking: tracking[0], click_tracking: tracking[1] }),
    },
  }
  return { client, calls }
}

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>

const fakeFetch = vi.fn(async (url: string) =>
  url.endsWith("/ping") ? new Response(JSON.stringify({ result: "PONG" }), { status: 200 }) : new Response(null, { status: 400 }),
)

async function doctor(overrides: Record<string, string> = {}, setup: Setup = {}, fetchImpl: FetchLike = fakeFetch) {
  const fake = fakeResend(setup)
  const lines = await runDoctor({ env: { ...env, ...overrides }, example, resend: () => fake.client, fetchImpl })
  return Object.fromEntries(lines.map((line: { check: string; status: string; detail: string }) => [line.check, line]))
}

describe("mail-agent doctor", () => {
  it("passes a complete setup, and says the switch is off", async () => {
    const lines = await doctor()
    for (const check of ["env", "upstash", "agent inbox", "human inbox", "agent inbox agent", "human inbox agent", "webhook", "endpoint", "tracking"]) {
      expect(lines[check]?.status, check).toBe("ok")
    }
    expect(lines.switch).toMatchObject({ status: "warn", detail: "EMAIL_AGENT_ENABLED is off" })
    expect(lines.relay).toMatchObject({ status: "warn", detail: "EMAIL_HUMAN_RELAY_ENABLED is off: human@ mail stays in its inbox" })
    expect((await doctor({ EMAIL_HUMAN_RELAY_ENABLED: "true" })).relay).toMatchObject({ status: "ok", detail: "EMAIL_HUMAN_RELAY_ENABLED is on" })
    expect(fakeFetch).toHaveBeenCalledWith("https://store.example.org/ping", { headers: { authorization: "Bearer test-token" } })
    expect(fakeFetch).toHaveBeenCalledWith("https://firstmove.energy/api/mail/inbound", expect.objectContaining({ method: "POST", redirect: "manual" }))
  })

  it("names empty and malformed variables, never their values", async () => {
    const lines = await doctor({ RESEND_API_KEY: "", EMAIL_CONFIRM_SECRET: "short-secret-value" })
    expect(lines.env.status).toBe("fail")
    expect(lines.env.detail).toBe("empty: RESEND_API_KEY; not 32 bytes of base64: EMAIL_CONFIRM_SECRET")
    expect(JSON.stringify(lines)).not.toContain("short-secret-value")
    expect(lines.webhook).toBeUndefined()
  })

  it("fails when the Inbox agent has actions, the human inbox is missing, or tracking is off", async () => {
    expect((await doctor({}, { agentActions: ["draft_reply"] }))["agent inbox agent"]).toMatchObject({ status: "fail", detail: "has actions: draft_reply" })
    expect((await doctor({}, { humanMissing: true }))["human inbox"].status).toBe("fail")
    expect((await doctor({}, { tracking: [true, false] })).tracking.status).toBe("fail")
  })

  it("fails without a webhook at SITE_URL, and warns about extra events", async () => {
    const elsewhere = [{ endpoint: "https://preview.example.org/api/mail/inbound", status: "enabled", events: [WEBHOOK_EVENT] }]
    expect((await doctor({}, { hooks: elsewhere })).webhook.status).toBe("fail")
    const disabled = [{ endpoint: "https://firstmove.energy/api/mail/inbound", status: "disabled", events: [WEBHOOK_EVENT] }]
    expect((await doctor({}, { hooks: disabled })).webhook.status).toBe("fail")
    const extra = [{ endpoint: "https://firstmove.energy/api/mail/inbound", status: "enabled", events: [WEBHOOK_EVENT, "email.received"] }]
    expect((await doctor({}, { hooks: extra })).webhook).toMatchObject({ status: "warn", detail: "also subscribed to email.received (ignored by the route)" })
  })

  it("fails when the endpoint redirects, is not deployed, or is unreachable", async () => {
    const ping = () => new Response(JSON.stringify({ result: "PONG" }), { status: 200 })
    const redirect: FetchLike = async (url) => (url.endsWith("/ping") ? ping() : new Response(null, { status: 308 }))
    expect((await doctor({}, {}, redirect)).endpoint).toMatchObject({ status: "fail", detail: "HTTP 308: redirects — webhook senders do not follow redirects" })
    const missing: FetchLike = async (url) => (url.endsWith("/ping") ? ping() : new Response(null, { status: 404 }))
    expect((await doctor({}, {}, missing)).endpoint.status).toBe("fail")
    const down: FetchLike = async () => {
      throw Object.assign(new Error("fetch failed"), { name: "TypeError" })
    }
    expect((await doctor({}, {}, down)).endpoint).toMatchObject({ status: "fail", detail: "unreachable (TypeError)" })
  })

  it("only reads", async () => {
    const fake = fakeResend()
    await runDoctor({ env, example, resend: () => fake.client, fetchImpl: fakeFetch })
    expect(Object.keys(fake.client.inboxes)).toEqual(["get", "agent"])
    expect(Object.keys(fake.client.webhooks)).toEqual(["list"])
  })

  it("agrees with the email agent on which variables have defaults", () => {
    const names = envNames(example)
    expect(names).toEqual(expect.arrayContaining([...OPTIONAL]))
    for (const name of names) {
      const without = { ...env, EMAIL_AGENT_ENABLED: "true", [name]: "" }
      const status = readMailAgentEnv(without).status
      if (OPTIONAL.has(name)) expect(status, name).not.toBe("incomplete")
      else expect(status, name).toBe("incomplete")
    }
  })

  it("prints one aligned line per check", () => {
    expect(formatLines([{ status: "ok", check: "env", detail: "19 names checked" }, { status: "fail", check: "webhook", detail: "none" }])).toBe(
      "ok    env      19 names checked\nfail  webhook  none",
    )
  })
})
