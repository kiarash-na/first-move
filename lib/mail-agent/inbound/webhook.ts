import "server-only"
import { Resend } from "resend"
import type { MailAgentConfig, MailAgentEnv } from "../env"
import { logEvent } from "../log"
import type { InboundInput } from "../pipeline/types"
import { keys, TTL } from "../store/keys"
import { createRedisStore } from "../store/redis"
import type { MailStore } from "../store/store"
import { parseEvent, type InboundRef } from "./event"
import { readBody } from "./read-body"
import { verifyWebhook } from "./verify"

/** Larger webhook bodies are refused before they are read in full (PLAN-AGENT-06 step 5). */
export const MAX_WEBHOOK_BYTES = 256 * 1024

export interface WebhookClients {
  resend: Pick<Resend, "webhooks">
  store: MailStore
}

export interface WebhookDeps {
  env: MailAgentEnv
  clients(config: MailAgentConfig): WebhookClients
  /** Starts the workflow for one email; the route passes `start(inboundEmail, [input])`. */
  start(input: InboundInput): Promise<unknown>
  /** Starts the human@ relay for an email to another inbox; the route passes `start(humanRelay, [ref])`. */
  startRelay(ref: InboundRef): Promise<unknown>
  now: number
}

const reply = (status: number, result: string) => {
  logEvent("webhook", { result, status })
  return new Response(null, { status })
}

/**
 * Resend's webhook for the inboxes (PLAN-AGENT-06 step 5, O8). Without a complete configuration
 * the route does not exist (404). Otherwise: a bounded read, the Svix signature on the raw body,
 * then only inbound `inbox.email.received` events go on. The agent's inbox starts the agent's
 * run, unless the agent is switched off; any other inbox starts the human@ relay, which checks
 * the inbox and passes human@'s mail on to a person without a model. Each Svix message starts one
 * run; when the start fails, the marker goes again so Resend's retry can start it. Responses
 * carry no detail.
 */
export async function handleWebhook(request: Request, deps: WebhookDeps): Promise<Response> {
  const { env } = deps
  if (env.status === "incomplete") return new Response(null, { status: 404 })

  const raw = await readBody(request, MAX_WEBHOOK_BYTES)
  if (raw === null) return reply(413, "too-large")

  const { config } = env
  const { resend, store } = deps.clients(config)
  const verified = verifyWebhook(resend, raw, request.headers, config.resend.webhookSecret, deps.now)
  if (!verified.ok) return reply(400, "unverified")

  const event = parseEvent(verified.payload)
  if (event.kind === "invalid") return reply(400, "invalid-event")
  if (event.kind === "ignored") return reply(200, "other-type")
  if (event.direction === "outbound") return reply(200, "outbound")
  const agent = event.ref.inboxId === config.resend.agentInboxId
  if (agent && env.status === "disabled") return reply(200, "disabled")

  const marker = keys.event(verified.svixId)
  if (!(await store.set(marker, "1", { ttlMs: TTL.event, ifAbsent: true }))) return reply(200, "duplicate")
  try {
    await (agent ? deps.start({ ...event.ref, origin: "webhook" }) : deps.startRelay(event.ref))
  } catch {
    await store.del(marker)
    return reply(500, "start-failed")
  }
  return reply(200, agent ? "started" : "relay-started")
}

let cached: WebhookClients | undefined

/** The live clients: `verify` needs no API call, and the Upstash client connects per request. */
export function webhookClients(config: MailAgentConfig): WebhookClients {
  cached ??= { resend: new Resend(config.resend.apiKey), store: createRedisStore(config.store) }
  return cached
}
