import "server-only"
import { sanitizeText } from "@/lib/ai/text/sanitize"
import { formatDateTime } from "@/lib/i18n/format/date"
import { formatNumber } from "@/lib/i18n/format/number"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { interpolate } from "@/lib/i18n/interpolate"
import { OPERATOR } from "@/lib/legal/operator"
import type { AlertDeps } from "../admin/alert"
import { isAutomated } from "../gates/loops"
import type { InboundRef } from "../inbound/event"
import { logEvent } from "../log"
import { humanFrom, OPERATOR_HEADERS } from "../pipeline/hand-off"
import { markDone } from "../pipeline/sender"
import { dayOf, keys, TTL } from "../store/keys"
import { normalizeAddress } from "../store/sender-id"

/** At most this many emails a UTC day go on to the person; then one note, then nothing until tomorrow. */
export const RELAY_PER_DAY = 100

const oneLine = (text: string) => sanitizeText(text.replace(/\s+/g, " ")).text.slice(0, 200).trim()

/**
 * human@ (O8): an email that arrives in the human@ inbox goes on to the person behind it
 * (`EMAIL_AGENT_ADMIN_ADDRESS`), the original attached, from human@. No model reads it. Reply-To
 * is the sender only when DMARC passed, so a reply never reaches a forged address. Machine mail,
 * mail from our own addresses or from the person (loops) and anything over the daily cap stay
 * in the inbox. Each email goes on once (`done`, the idempotency key). Returns a code.
 */
export async function relayToPerson(deps: AlertDeps, ref: InboundRef, now: number): Promise<string> {
  const { store, transport, config } = deps
  if (await store.get(keys.done(ref.emailId))) return "done"
  const finish = async (code: string) => {
    await markDone(store, ref.emailId, code)
    logEvent("relay", { result: code })
    return code
  }

  const inbox = await transport.inboxAddress(ref.inboxId)
  if (!inbox || normalizeAddress(inbox) !== normalizeAddress(OPERATOR.emailHuman)) return finish("other-inbox")
  const email = await transport.getEmail(ref.emailId)
  if (!email) return "gone"
  if (!email.from) return finish("no-address")
  const own = [config.addresses.agent, config.addresses.admin, OPERATOR.emailAgent, OPERATOR.emailHuman].map(normalizeAddress)
  if (isAutomated({ ...email, from: email.from }) || own.includes(normalizeAddress(email.from))) return finish("loop")

  const count = await store.incr(keys.relay(dayOf(now)), TTL.relay)
  const { admin } = await getDictionary("en", "mail")
  const values = { inbox: OPERATOR.emailHuman, max: formatNumber(RELAY_PER_DAY, "en") }
  if (count > RELAY_PER_DAY + 1) return finish("relay-full")
  if (count > RELAY_PER_DAY) {
    const subject = interpolate(admin.subject, { kind: interpolate(admin.relay.more, values) })
    await transport.send({ from: humanFrom(), to: config.addresses.admin, subject, text: interpolate(admin.relay.more, values), headers: OPERATOR_HEADERS, idempotencyKey: `relay/more/${dayOf(now)}` })
    return finish("relay-full")
  }

  const verified = email.authentication.dmarc === "pass"
  const subject = oneLine(email.subject) || "–"
  const at = `${formatDateTime(new Date(now).toISOString(), "en", { timeZone: "UTC" })} UTC`
  const cover = [interpolate(admin.relay.body, { ...values, address: email.from, at, subject }), verified ? admin.relay.replyable : admin.relay.unverified].join("\n\n")
  await transport.forward({
    emailId: email.id,
    from: humanFrom(),
    to: config.addresses.admin,
    ...(verified && { replyTo: email.from }),
    subject: interpolate(admin.relay.subject, { inbox: OPERATOR.emailHuman, subject }),
    text: cover,
    headers: OPERATOR_HEADERS,
    idempotencyKey: `relay/${email.id}`,
  })
  return finish(verified ? "relayed" : "relayed-unverified")
}
