import "server-only"
import { guardPhase, loadConversation } from "../conversation/state"
import { decideGuard, decisionCost, type GuardResult } from "../guard/decide"
import { guardState } from "../guard/state"
import { logEvent } from "../log"
import { addSpend } from "../store/budget"
import { loadSender } from "./sender"
import type { InboundInput, MailDeps } from "./types"

/**
 * The guard step (D-52): Jev judges the email once, with the conversation's phase as context,
 * and the spend counts against today's budget. Its result is only codes and numbers, so the
 * workflow can keep it: a later step that runs again acts on the same judgment instead of
 * asking Jev twice.
 */
export async function judgeEmail(deps: MailDeps, input: InboundInput, now: number): Promise<GuardResult> {
  const sender = await loadSender(deps, input)
  if (!sender) return { ok: false, reason: "failed" }
  const phase = guardPhase(await loadConversation(deps.store, deps.config.secrets.state, sender.sid))
  const started = Date.now()
  const result = await decideGuard(deps.decisionModel, guardState(sender.email, phase))
  if (result.ok) await addSpend(deps.store, decisionCost(result.inputTokens), now)
  logEvent("guard", { ok: result.ok, reason: result.ok ? null : result.reason, phase, ms: Date.now() - started })
  return result
}
