#!/usr/bin/env node
/**
 * `node --env-file=.env.local scripts/mail-agent-doctor.mjs` (PLAN-AGENT-06 step 14): a read-only
 * check of the email agent's setup before it is switched on. It reads only (GET requests) and
 * prints names and codes, never a value:
 *
 * - every variable of `.env.example` is set, and the secrets are 32 bytes of base64;
 * - Upstash answers;
 * - the agent@ and human@ inboxes exist, and Resend's Inbox agent has no actions on either (D-53);
 * - one enabled webhook for `inbox.email.received` points at `SITE_URL/api/mail/inbound`;
 * - the mail domain has open and click tracking on, as the Privacy Policy discloses (D-63).
 *
 * Exits with 1 when a check fails. `scripts/mail-agent-doctor.test.ts` runs it against fakes.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

export const WEBHOOK_EVENT = "inbox.email.received"
export const WEBHOOK_PATH = "/api/mail/inbound"

/** Names with a default in `lib/mail-agent/env.ts`, and the switch itself: they may stay empty. */
export const OPTIONAL = new Set([
  "EMAIL_AGENT_ENABLED",
  "EMAIL_AGENT_DAILY_BUDGET_USD",
  "EMAIL_AGENT_SENDER_PER_HOUR",
  "EMAIL_AGENT_SENDER_PER_DAY",
  "EMAIL_AGENT_GLOBAL_PER_DAY",
  "EMAIL_AGENT_DECISION_MODEL",
  "EMAIL_AGENT_TEXT_MODEL",
])
const SECRETS = new Set(["EMAIL_AGENT_HASH_SECRET", "EMAIL_AGENT_STATE_KEY", "EMAIL_CONFIRM_SECRET"])
const ALIASES = { KV_REST_API_URL: "UPSTASH_REDIS_REST_URL", KV_REST_API_TOKEN: "UPSTASH_REDIS_REST_TOKEN" }

/** The variable names `.env.example` lists, in order. */
export function envNames(example) {
  return [...example.matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map(([, name]) => name)
}

const read = (env, name) => (env[name] ?? env[ALIASES[name]] ?? "").trim()

/** One line of the report: `ok`, `warn` (works, but not as planned) or `fail`. */
const result = (status, check, detail) => ({ status, check, detail })

/** Names only: which variables are empty and which secrets are not 32 bytes of base64. */
export function checkEnv(env, names) {
  const missing = names.filter((name) => !OPTIONAL.has(name) && !read(env, name))
  const malformed = names.filter((name) => SECRETS.has(name) && read(env, name) && !/^[A-Za-z0-9+/]{43}=$/.test(read(env, name)))
  if (missing.length || malformed.length) {
    const parts = [missing.length && `empty: ${missing.join(", ")}`, malformed.length && `not 32 bytes of base64: ${malformed.join(", ")}`]
    return result("fail", "env", parts.filter(Boolean).join("; "))
  }
  return result("ok", "env", `${names.length} names checked`)
}

const enabled = (env) => ["true", "1"].includes(read(env, "EMAIL_AGENT_ENABLED").toLowerCase())
const domainOf = (address) => address.slice(address.lastIndexOf("@") + 1).toLowerCase()
const code = (error) => String(error?.name ?? "unknown_error").replace(/[^a-z_]/gi, "")

async function checkStore(env, fetchImpl) {
  try {
    const response = await fetchImpl(`${read(env, "KV_REST_API_URL").replace(/\/+$/, "")}/ping`, {
      headers: { authorization: `Bearer ${read(env, "KV_REST_API_TOKEN")}` },
    })
    const body = response.ok ? await response.json() : null
    return body?.result === "PONG" ? result("ok", "upstash", "reachable") : result("fail", "upstash", `HTTP ${response.status}`)
  } catch (error) {
    return result("fail", "upstash", `unreachable (${code(error)})`)
  }
}

async function checkInboxes(env, resend) {
  const agentAddress = read(env, "EMAIL_AGENT_ADDRESS").toLowerCase()
  const humanAddress = `human@${domainOf(agentAddress)}`
  const agent = await resend.inboxes.get(read(env, "RESEND_AGENT_INBOX_ID"))
  const human = await resend.inboxes.get(humanAddress)
  const lines = []

  if (agent.error) lines.push(result("fail", "agent inbox", `RESEND_AGENT_INBOX_ID not found (${code(agent.error)})`))
  else if (agent.data.email_address.toLowerCase() !== agentAddress) lines.push(result("fail", "agent inbox", "RESEND_AGENT_INBOX_ID is not the inbox of EMAIL_AGENT_ADDRESS"))
  else lines.push(result("ok", "agent inbox", "exists"))

  if (human.error) lines.push(result("fail", "human inbox", `human@ of the agent's domain not found (${code(human.error)})`))
  else if (human.data.id === agent.data?.id) lines.push(result("fail", "human inbox", "is the agent inbox"))
  else lines.push(result("ok", "human inbox", "exists"))

  for (const [label, inbox] of [["agent", agent], ["human", human]]) {
    if (inbox.error) continue
    const settings = await resend.inboxes.agent.get({ inboxId: inbox.data.id })
    if (settings.error) lines.push(result("fail", `${label} inbox agent`, `not readable (${code(settings.error)})`))
    else if (settings.data.actions.length > 0) lines.push(result("fail", `${label} inbox agent`, `has actions: ${settings.data.actions.join(", ")}`))
    else lines.push(result("ok", `${label} inbox agent`, "no actions"))
  }
  return lines
}

async function checkWebhook(env, resend) {
  const endpoint = `${read(env, "SITE_URL").replace(/\/+$/, "")}${WEBHOOK_PATH}`
  const list = await resend.webhooks.list()
  if (list.error) return result("fail", "webhook", `not readable (${code(list.error)})`)
  const hooks = list.data.data.filter((hook) => hook.endpoint === endpoint && hook.status === "enabled" && hook.events?.includes(WEBHOOK_EVENT))
  if (hooks.length === 0) return result("fail", "webhook", `no enabled webhook for ${WEBHOOK_EVENT} at SITE_URL${WEBHOOK_PATH}`)
  if (hooks.length > 1) return result("warn", "webhook", `${hooks.length} webhooks for the same endpoint start a run each`)
  const others = (hooks[0].events ?? []).filter((event) => event !== WEBHOOK_EVENT)
  if (others.length) return result("warn", "webhook", `also subscribed to ${others.join(", ")} (ignored by the route)`)
  return result("ok", "webhook", `${WEBHOOK_EVENT} only`)
}

async function checkTracking(env, resend) {
  const name = domainOf(read(env, "EMAIL_AGENT_ADDRESS"))
  const list = await resend.domains.list()
  if (list.error) return result("fail", "tracking", `domains not readable (${code(list.error)})`)
  const found = list.data.data.find((domain) => domain.name.toLowerCase() === name)
  if (!found) return result("fail", "tracking", "the agent's mail domain is not in Resend")
  const domain = await resend.domains.get(found.id)
  if (domain.error) return result("fail", "tracking", `domain not readable (${code(domain.error)})`)
  if (domain.data.open_tracking === true && domain.data.click_tracking === true) return result("ok", "tracking", "open and click tracking on (D-63)")
  return result("fail", "tracking", "open and click tracking must both be on, as the Privacy Policy discloses (D-63)")
}

/** Runs every check; API checks run only when the variables they need are set. */
export async function runDoctor({ env, example, resend, fetchImpl }) {
  const names = envNames(example)
  const lines = [checkEnv(env, names), result(enabled(env) ? "ok" : "warn", "switch", enabled(env) ? "EMAIL_AGENT_ENABLED is on" : "EMAIL_AGENT_ENABLED is off")]
  const has = (...wanted) => wanted.every((name) => read(env, name))

  if (has("KV_REST_API_URL", "KV_REST_API_TOKEN")) lines.push(await checkStore(env, fetchImpl))
  if (has("RESEND_API_KEY", "EMAIL_AGENT_ADDRESS")) {
    const client = resend(read(env, "RESEND_API_KEY"))
    try {
      if (has("RESEND_AGENT_INBOX_ID")) lines.push(...(await checkInboxes(env, client)))
      if (has("SITE_URL")) lines.push(await checkWebhook(env, client))
      lines.push(await checkTracking(env, client))
    } catch (error) {
      lines.push(result("fail", "resend", `request failed (${code(error)})`))
    }
  }
  return lines
}

export function formatLines(lines) {
  const width = Math.max(...lines.map((line) => line.check.length))
  return lines.map((line) => `${line.status.padEnd(4)}  ${line.check.padEnd(width)}  ${line.detail}`).join("\n")
}

async function main() {
  const { Resend } = await import("resend")
  const lines = await runDoctor({
    env: process.env,
    example: readFileSync(path.join(ROOT, ".env.example"), "utf8"),
    resend: (apiKey) => new Resend(apiKey),
    fetchImpl: fetch,
  })
  console.log(formatLines(lines))
  if (lines.some((line) => line.status === "fail")) process.exitCode = 1
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main()
