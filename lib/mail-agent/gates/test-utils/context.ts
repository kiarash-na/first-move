import { readMailAgentEnv, type MailAgentConfig } from "../../env"
import type { InboundEmail } from "../../inbound/transport"
import { createMemoryStore } from "../../store/memory-store"
import type { MailStore } from "../../store/store"
import type { GateContext } from "../types"

const key = (fill: number) => Buffer.alloc(32, fill).toString("base64")

/** A complete, switched-on configuration for tests (no real keys). */
export function testConfig(overrides: Record<string, string> = {}): MailAgentConfig {
  const env = readMailAgentEnv({
    SITE_URL: "https://firstmove.energy",
    EMAIL_AGENT_ENABLED: "true",
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
    ...overrides,
  })
  if (env.status !== "ready") throw new Error(`test config is ${env.status}`)
  return env.config
}

/** A received email that passes every gate unless a test changes it. */
export function testEmail(overrides: Partial<InboundEmail> = {}): InboundEmail & { from: string } {
  return {
    id: "email-1",
    from: "jane@example.org",
    to: ["agent@mail.firstmove.energy"],
    replyTo: [],
    subject: "Quick Check for our village",
    text: "Hello, we have 120 buildings on 12 ha. Can you run a Quick Check?",
    headers: { "content-type": "text/plain" },
    messageId: "<m1@example.org>",
    authentication: { spf: "pass", dkim: "pass", dmarc: "pass" },
    attachments: [],
    ...overrides,
  } as InboundEmail & { from: string }
}

export function testContext(overrides: Partial<GateContext> = {}, store: MailStore = createMemoryStore()): GateContext {
  return {
    email: testEmail(),
    sid: "sid-jane",
    domainSid: "domain-example",
    domain: "example.org",
    config: testConfig(),
    store,
    now: Date.UTC(2026, 9, 24, 12),
    ...overrides,
  }
}
