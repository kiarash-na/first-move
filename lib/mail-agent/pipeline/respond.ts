import "server-only"
import { parseReply } from "../conversation/commands"
import { loadOutbox } from "../conversation/outbox"
import { planTurn } from "../conversation/plan-turn"
import { loadConversation } from "../conversation/state"
import type { Intent } from "../guard/questions"
import { emailLocale } from "../locale/email-locale"
import { logEvent, sidPrefix } from "../log"
import { converse } from "./converse"
import { deliver } from "./deliver"
import { endConversation } from "./end-conversation"
import { handOff } from "./hand-off"
import { loadSender, markDone } from "./sender"
import type { InboundInput, MailDeps } from "./types"

/**
 * The answer to allowed mail (PLAN-AGENT-07): first a reply this email already has (a step that
 * runs again sends it, and never decides twice), then the turn's plan: stop, a person, or a
 * conversation turn in the sender's language. Returns the reply's kind.
 */
export async function respond(deps: MailDeps, input: InboundInput, action: "allow" | "small_talk", intent: Intent | null, now: number): Promise<string> {
  const { store, config } = deps
  const sender = await loadSender(deps, input)
  if (!sender) {
    await markDone(store, input.emailId, "no-address")
    return "no-address"
  }
  const { email, sid } = sender

  const pending = await loadOutbox(store, config.secrets.state, email.id)
  if (pending) return deliver(deps, input, sender, pending)
  const saved = await loadConversation(store, config.secrets.state, sid)
  if (saved?.reply?.emailId === email.id) return deliver(deps, input, sender, saved.reply)
  if (saved?.handled.includes(email.id)) {
    await markDone(store, email.id, "duplicate")
    return "duplicate"
  }

  const locale = emailLocale(email, saved?.locale)
  const parsed = parseReply(email.text)
  const attachments = email.attachments.filter((file) => !file.inline).length
  const plan = planTurn({ state: saved, locale, threadId: input.threadId, parsed, intent, action, attachments, now })
  logEvent("plan", { sid: sidPrefix(sid), kind: plan.kind, locale, intent, command: parsed.command })

  if (plan.kind === "stop") return endConversation(deps, input, sender, locale, plan.hadConversation)
  if (plan.kind === "handoff") return handOff(deps, input, sender, locale, now)
  return converse(deps, { input, sender, saved, locale, parsed, plan, attachments, now })
}
