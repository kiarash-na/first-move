import "server-only"
import { z } from "zod"

type Env = Readonly<Record<string, string | undefined>>

/** 32 random bytes, standard base64 (`openssl rand -base64 32`). */
const secret = z
  .string()
  .regex(/^[A-Za-z0-9+/]{43}=$/)
  .transform((value) => new Uint8Array(Buffer.from(value, "base64")))

const count = z.coerce.number().int().positive().max(1_000_000)
const model = z.string().regex(/^[a-z0-9-]+\/[a-z0-9.-]+$/)

/** The Gateway model the email agent writes with unless `EMAIL_AGENT_TEXT_MODEL` names another (D-64). */
export const DEFAULT_TEXT_MODEL = "anthropic/claude-haiku-5.5"

/** Every name of `.env.example` with its rule. Values never leave this module in errors. */
const SCHEMA = z.object({
  SITE_URL: z.url({ protocol: /^https?$/ }).transform((url) => url.replace(/\/+$/, "")),
  EMAIL_AGENT_DAILY_BUDGET_USD: z.coerce.number().positive().max(1000).default(2),
  EMAIL_AGENT_SENDER_PER_HOUR: count.default(10),
  EMAIL_AGENT_SENDER_PER_DAY: count.default(30),
  EMAIL_AGENT_GLOBAL_PER_DAY: count.default(500),
  EMAIL_AGENT_ADDRESS: z.email().toLowerCase(),
  EMAIL_AGENT_ADMIN_ADDRESS: z.email().toLowerCase(),
  RESEND_API_KEY: z.string().regex(/^re_[A-Za-z0-9_]+$/),
  RESEND_WEBHOOK_SECRET: z.string().regex(/^whsec_[A-Za-z0-9+/=]+$/),
  RESEND_AGENT_INBOX_ID: z.string().regex(/^[A-Za-z0-9_-]{1,100}$/),
  AI_GATEWAY_API_KEY: z.string().min(1).max(500),
  EMAIL_AGENT_DECISION_MODEL: model.default("typesafe-ai/jev-1.14.0"),
  EMAIL_AGENT_TEXT_MODEL: model.default(DEFAULT_TEXT_MODEL),
  KV_REST_API_URL: z.url({ protocol: /^https$/ }),
  KV_REST_API_TOKEN: z.string().min(1).max(500),
  EMAIL_AGENT_HASH_SECRET: secret,
  EMAIL_AGENT_STATE_KEY: secret,
  EMAIL_CONFIRM_SECRET: secret,
})

/** Upstash names the Vercel Marketplace may inject instead of the KV ones. */
const ALIASES: Record<string, string> = {
  KV_REST_API_URL: "UPSTASH_REDIS_REST_URL",
  KV_REST_API_TOKEN: "UPSTASH_REDIS_REST_TOKEN",
}

export interface MailAgentConfig {
  siteUrl: string
  /**
   * `EMAIL_HUMAN_RELAY_ENABLED`: pass human@'s mail on to the admin address (O8). Off unless set,
   * because the Privacy Policy must name the forwarding and the mailbox first (A08).
   */
  humanRelay: boolean
  limits: { dailyBudgetUsd: number; senderPerHour: number; senderPerDay: number; globalPerDay: number }
  addresses: { agent: string; admin: string }
  resend: { apiKey: string; webhookSecret: string; agentInboxId: string }
  gateway: { apiKey: string; decisionModel: string; textModel: string }
  store: { url: string; token: string }
  secrets: { hash: Uint8Array; state: Uint8Array; confirm: Uint8Array }
}

export type MailAgentEnv =
  | { status: "ready"; config: MailAgentConfig }
  /** Complete but switched off: the webhook still verifies signatures, then drops (PLAN-AGENT-06). */
  | { status: "disabled"; config: MailAgentConfig }
  /** Names only: `missing` are empty, `invalid` have a value that breaks their rule. */
  | { status: "incomplete"; enabled: boolean; missing: string[]; invalid: string[] }

/** `true` (or `1`) switches on; anything else keeps it off. */
const switchedOn = (value: string | undefined) => ["true", "1"].includes((value ?? "").trim().toLowerCase())

/** `EMAIL_AGENT_ENABLED=true` (or `1`) switches the agent on; anything else keeps it off. */
export function isEnabled(env: Env): boolean {
  return switchedOn(env.EMAIL_AGENT_ENABLED)
}

/**
 * Reads the email agent's settings (PLAN-AGENT-00 § Environment). The agent runs only when it is
 * switched on and every value is present and valid. Complete but switched off is `disabled`;
 * otherwise it is `incomplete`, with the names to fix, never their values.
 */
export function readMailAgentEnv(env: Env): MailAgentEnv {
  const input: Record<string, string> = {}
  for (const name of Object.keys(SCHEMA.shape)) {
    const value = (env[name] ?? (ALIASES[name] ? env[ALIASES[name]] : undefined))?.trim()
    if (value) input[name] = value
  }

  const parsed = SCHEMA.safeParse(input)
  const enabled = isEnabled(env)
  if (!parsed.success) {
    const names = [...new Set(parsed.error.issues.map((issue) => String(issue.path[0])))]
    const missing = names.filter((name) => !(name in input))
    const invalid = names.filter((name) => name in input)
    return { status: "incomplete", enabled, missing, invalid }
  }

  const v = parsed.data
  return {
    status: enabled ? "ready" : "disabled",
    config: {
      siteUrl: v.SITE_URL,
      humanRelay: switchedOn(env.EMAIL_HUMAN_RELAY_ENABLED),
      limits: {
        dailyBudgetUsd: v.EMAIL_AGENT_DAILY_BUDGET_USD,
        senderPerHour: v.EMAIL_AGENT_SENDER_PER_HOUR,
        senderPerDay: v.EMAIL_AGENT_SENDER_PER_DAY,
        globalPerDay: v.EMAIL_AGENT_GLOBAL_PER_DAY,
      },
      addresses: { agent: v.EMAIL_AGENT_ADDRESS, admin: v.EMAIL_AGENT_ADMIN_ADDRESS },
      resend: { apiKey: v.RESEND_API_KEY, webhookSecret: v.RESEND_WEBHOOK_SECRET, agentInboxId: v.RESEND_AGENT_INBOX_ID },
      gateway: { apiKey: v.AI_GATEWAY_API_KEY, decisionModel: v.EMAIL_AGENT_DECISION_MODEL, textModel: v.EMAIL_AGENT_TEXT_MODEL },
      store: { url: v.KV_REST_API_URL, token: v.KV_REST_API_TOKEN },
      secrets: { hash: v.EMAIL_AGENT_HASH_SECRET, state: v.EMAIL_AGENT_STATE_KEY, confirm: v.EMAIL_CONFIRM_SECRET },
    },
  }
}

let cached: MailAgentEnv | undefined

/** The settings of this process, read once. */
export function mailAgentEnv(): MailAgentEnv {
  cached ??= readMailAgentEnv(process.env)
  return cached
}
