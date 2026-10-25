import "server-only"
import type { Locale } from "@/lib/i18n/locales"
import { saveOutbox } from "../conversation/outbox"
import { stoppedSection } from "../conversation/sections"
import { deleteConversation } from "../conversation/state"
import { loadTexts } from "../conversation/texts"
import { composeReply } from "../outbound/message"
import { withSenderLock } from "../store/lock"
import { deliver, toStored } from "./deliver"
import type { Sender } from "./sender"
import { SenderBusyError, type InboundInput, type MailDeps } from "./types"

/**
 * "stop" (PLAN-AGENT-07 step 6): deletes the conversation with its draft at once, under the
 * sender's lock, and confirms it. The reply goes to the outbox first, so a retried step sends
 * the same confirmation. Consent and the guard's records stay (D-56); the reply says whom to ask.
 */
export async function endConversation(deps: MailDeps, input: InboundInput, sender: Sender, locale: Locale, hadConversation: boolean): Promise<string> {
  const t = await loadTexts(locale)
  const stored = toStored(sender.email.id, locale, await composeReply(deps.config, locale, "stopped", [stoppedSection(t, { hadConversation })]))
  const locked = await withSenderLock(deps.store, sender.sid, async () => {
    await saveOutbox(deps.store, deps.config.secrets.state, stored)
    await deleteConversation(deps.store, sender.sid)
  })
  if (!locked.ok) throw new SenderBusyError()
  return deliver(deps, input, sender, stored)
}
