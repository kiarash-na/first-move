import "server-only"
import { addPending } from "../consent/pending"
import { CONFIRM_DAYS, confirmToken, tokenIdFor } from "../consent/token"
import { logEvent, sidPrefix } from "../log"
import { emailLocale } from "../locale/email-locale"
import { sitePage } from "../outbound/message"
import { confirmNotice } from "../outbound/notices"
import { sendReply } from "../outbound/send"
import { keys, TTL } from "../store/keys"
import { withSenderLock } from "../store/lock"
import { loadSender, markDone } from "./sender"
import { SenderBusyError, type InboundInput, type MailDeps } from "./types"

/**
 * A sender without consent (D-54): the email waits (ids only, at most three, seven days) and the
 * sender gets one confirm link a day. Nothing is read by a model until they confirm. Returns a
 * code: `consent-asked`, `consent-waiting` (a link went out within 24 hours) or `pending-full`.
 */
export async function askConsent(deps: MailDeps, input: InboundInput, now: number): Promise<string> {
  const { config, store } = deps
  const sender = await loadSender(deps, input)
  if (!sender) return "no-address"
  const { email, sid } = sender
  const ref = { emailId: email.id, threadId: input.threadId, inboxId: input.inboxId }

  const locked = await withSenderLock(store, sid, async () => {
    if ((await addPending(store, config.secrets.state, sid, ref, now)) === "full") return null
    // One link a day: the email that set the marker owns it, so its retried step sends the same link again.
    const marker = keys.confirmSent(sid)
    const owner = (await store.set(marker, email.id, { ttlMs: TTL.confirmSent, ifAbsent: true })) ? email.id : await store.get(marker)
    if (owner !== email.id) return ""
    const tokenId = await tokenIdFor(config.secrets.confirm, email.id)
    await store.set(keys.confirm(tokenId), JSON.stringify({ sid }), { ttlMs: TTL.confirm })
    return confirmToken(config.secrets.confirm, tokenId, Math.floor(now / 1000) + CONFIRM_DAYS * 86_400)
  })
  if (!locked.ok) throw new SenderBusyError()

  if (locked.value === null) {
    await markDone(store, email.id, "pending-full")
    logEvent("dropped", { sid: sidPrefix(sid), reason: "pending-full" })
    return "pending-full"
  }
  if (!locked.value) {
    logEvent("consent", { sid: sidPrefix(sid), status: "waiting" })
    return "consent-waiting"
  }
  // Nothing is known about the sender yet: the confirmation speaks the language the email is written in.
  const locale = emailLocale(email)
  const link = `${sitePage(config, locale, "/mail/confirm")}#t=${locked.value}`
  await sendReply(deps.transport, config, email, input, await confirmNotice(config, locale, link), locale)
  logEvent("consent", { sid: sidPrefix(sid), status: "asked" })
  return "consent-asked"
}
