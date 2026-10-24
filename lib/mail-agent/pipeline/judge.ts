import "server-only"
import { decideGuard, decisionCost, type GuardResult } from "../guard/decide"
import { guardState } from "../guard/state"
import { logEvent } from "../log"
import { addSpend } from "../store/budget"
import { loadSender } from "./sender"
import type { InboundInput, MailDeps } from "./types"

/** Where the conversation stands, for the guard's state; phase 07 reads it from `conv:{sid}`. */
export const NEW_CONVERSATION = "new"

/**
 * The guard step (D-52): Jev judges the email once, and the spend counts against today's budget.
 * Its result is only codes and numbers, so the workflow can keep it: a later step that runs again
 * acts on the same judgment instead of asking Jev twice.
 */
export async function judgeEmail(deps: MailDeps, input: InboundInput, now: number): Promise<GuardResult> {
  const sender = await loadSender(deps, input)
  if (!sender) return { ok: false, reason: "failed" }
  const started = Date.now()
  const result = await decideGuard(deps.decisionModel, guardState(sender.email, NEW_CONVERSATION))
  if (result.ok) await addSpend(deps.store, decisionCost(result.inputTokens), now)
  logEvent("guard", { ok: result.ok, reason: result.ok ? null : result.reason, ms: Date.now() - started })
  return result
}
