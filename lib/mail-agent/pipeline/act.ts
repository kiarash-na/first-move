import "server-only"
import { sendAlert } from "../admin/alert"
import type { GuardResult } from "../guard/decide"
import { verdictFor } from "../guard/policy"
import { applyVerdict } from "../guard/sanctions"
import { logEvent, sidPrefix } from "../log"
import { notice } from "../outbound/notices"
import { sendReply } from "../outbound/send"
import { withSenderLock } from "../store/lock"
import { loadSender, markDone } from "./sender"
import { SenderBusyError, type InboundInput, type MailDeps } from "./types"

export type ActResult = { next: "stop"; code: string } | { next: "respond"; action: "allow" | "small_talk" }

const scoresOf = (result: GuardResult): Record<string, number> =>
  result.ok
    ? { injection: result.decision.injection, harassment: result.decision.harassment, malicious: result.decision.malicious, "off-topic": result.decision.offTopic }
    : {}

/**
 * Acts on the guard's verdict (PLAN-AGENT-06 step 9, D-55): a strike sends the warning or the
 * ban notice, a block sends its one notice and alerts the admin, a guard that could not judge
 * tells the sender to try later and alerts the admin. Safe to repeat. Allowed mail goes on to
 * `respond`; everything else is done here and never acted on.
 */
export async function act(deps: MailDeps, input: InboundInput, result: GuardResult, now: number): Promise<ActResult> {
  const { store } = deps
  const sender = await loadSender(deps, input)
  if (!sender) return { next: "stop", code: "no-address" }
  const { email, sid } = sender
  const verdict = verdictFor(result)

  const locked = await withSenderLock(store, sid, () => applyVerdict(store, sid, email.id, verdict, now))
  if (!locked.ok) throw new SenderBusyError()
  if (locked.value) await sendReply(deps.transport, deps.config, email, input, await notice(locked.value))

  const category = verdict.action === "block" ? verdict.category : result.ok ? null : result.reason
  if (category) await sendAlert(deps, { kind: verdict.action === "block" ? "block" : "guard-failed", email, category, scores: scoresOf(result) }, now)

  logEvent("verdict", { sid: sidPrefix(sid), action: verdict.action, notice: locked.value, ...(category && { category }) })
  if (verdict.action === "allow" || verdict.action === "small_talk") return { next: "respond", action: verdict.action }
  const code = verdict.action === "strike" ? `strike-${verdict.reason}` : verdict.action
  await markDone(store, email.id, code)
  return { next: "stop", code }
}
