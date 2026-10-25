import "server-only"
import { z } from "zod"
import type { MailAgentConfig, MailAgentEnv } from "../env"
import { readBody } from "../inbound/read-body"
import { logEvent, sidPrefix } from "../log"
import type { InboundInput } from "../pipeline/types"
import { keys, TTL } from "../store/keys"
import { withSenderLock } from "../store/lock"
import { createRedisStore } from "../store/redis"
import type { MailStore } from "../store/store"
import { recordConsent } from "./consent"
import { pendingOf, removePending } from "./pending"
import { readConfirmToken } from "./token"

/** A confirm request is `{ "token": "v1.…" }`; anything longer is not one. */
const MAX_CONFIRM_BYTES = 1024
const BODY = z.object({ token: z.string().max(200) })
const RECORD = z.object({ sid: z.string() })

/**
 * What the confirm page turns into copy (`mail.json` `confirm.result.*`): 200 confirmed, 410
 * expired, 409 already used, 400 invalid, anything else an error to try again later.
 */
export const CONFIRM_STATUS = { confirmed: 200, invalid: 400, forbidden: 403, used: 409, expired: 410, error: 500, unavailable: 503 } as const

export interface ConfirmDeps {
  env: MailAgentEnv
  store(config: MailAgentConfig): MailStore
  /** Starts the workflow for one waiting email; the route passes `start(inboundEmail, [input])`. */
  start(input: InboundInput): Promise<unknown>
  /** The versions of the Terms and the Privacy Policy the sender accepts (D-54). */
  versions: { terms: string; privacy: string }
  now: number
}

const reply = (result: keyof typeof CONFIRM_STATUS, fields: Record<string, string | number> = {}) => {
  logEvent("confirm", { result, ...fields })
  return new Response(null, { status: CONFIRM_STATUS[result] })
}

function parse<T>(schema: z.ZodType<T>, raw: string): T | null {
  try {
    const parsed = schema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

async function readToken(request: Request): Promise<string | null> {
  const raw = await readBody(request, MAX_CONFIRM_BYTES)
  return raw === null ? null : (parse(BODY, raw)?.token ?? null)
}

/**
 * The consent click (PLAN-AGENT-06 step 8, D-54). Only a POST from the page we served counts —
 * the Origin must match the origin the request reached — so a link scanner that opens the page
 * confirms nothing, and a host redirect in front of the page (apex → www, a preview deployment)
 * cannot forbid the confirm: the page and this route are always on the same origin. The token is
 * checked, then used up (`GETDEL`); the consent is recorded with the Terms and Privacy versions;
 * then every email that waited starts, oldest first, under the sender's lock. If a start fails,
 * the token is restored, so the same link works again; emails that did start are no longer
 * waiting.
 */
export async function handleConfirm(request: Request, deps: ConfirmDeps): Promise<Response> {
  const { env, now } = deps
  if (env.status === "incomplete") return new Response(null, { status: 404 })
  if (env.status === "disabled") return reply("unavailable")

  const { config } = env
  if (request.headers.get("origin") !== new URL(request.url).origin) return reply("forbidden")

  const token = await readToken(request)
  if (token === null) return reply("invalid")
  const check = await readConfirmToken(config.secrets.confirm, token, now)
  if (!check.ok) return reply(check.reason)

  const store = deps.store(config)
  const recordKey = keys.confirm(check.tokenId)
  const raw = await store.getdel(recordKey)
  if (raw === null) return reply("used")
  const record = parse(RECORD, raw)
  if (!record) return reply("invalid")
  const { sid } = record
  const restore = () => store.set(recordKey, raw, { ttlMs: TTL.confirm })

  try {
    // Consent first: the runs it starts check for it, and would otherwise ask again.
    await recordConsent(store, sid, { at: new Date(now).toISOString(), ...deps.versions })
    const locked = await withSenderLock(store, sid, async () => {
      const started: string[] = []
      try {
        for (const ref of await pendingOf(store, config.secrets.state, sid, now)) {
          await deps.start({ emailId: ref.emailId, threadId: ref.threadId, inboxId: ref.inboxId, origin: "consent" })
          started.push(ref.emailId)
        }
        return { started: started.length, failed: false }
      } catch {
        return { started: started.length, failed: true }
      } finally {
        if (started.length > 0) await removePending(store, config.secrets.state, sid, started, now)
      }
    })
    if (!locked.ok) {
      await restore()
      return reply("unavailable", { sid: sidPrefix(sid) })
    }
    if (locked.value.failed) {
      await restore()
      return reply("error", { sid: sidPrefix(sid), started: locked.value.started })
    }
    return reply("confirmed", { sid: sidPrefix(sid), started: locked.value.started })
  } catch {
    await restore()
    return reply("error", { sid: sidPrefix(sid) })
  }
}

let cached: MailStore | undefined

/** The live store; the Upstash client connects per request. */
export function confirmStore(config: MailAgentConfig): MailStore {
  cached ??= createRedisStore(config.store)
  return cached
}
