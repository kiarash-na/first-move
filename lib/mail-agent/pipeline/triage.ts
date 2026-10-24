import "server-only"
import { alertOncePerDay } from "../admin/alert"
import { hasConsent, touchConsent } from "../consent/consent"
import { RESUMED_GATES, runGates } from "../gates/run-gates"
import { logEvent, sidPrefix } from "../log"
import { domainIds, loadSender, markDone } from "./sender"
import type { InboundInput, MailDeps } from "./types"

export type TriageResult = { next: "stop"; code: string } | { next: "consent" } | { next: "guard" }

/**
 * The first step (PLAN-AGENT-06 steps 7 and 8): the deterministic gates, then consent. A drop is
 * silent and final (`done`), except that the global limit and the budget alert the admin once a
 * day. A sender without consent goes to `askConsent`, and no model sees the email before that.
 */
export async function triage(deps: MailDeps, input: InboundInput, now: number): Promise<TriageResult> {
  const { store } = deps
  const sender = await loadSender(deps, input)
  if (!sender) {
    await markDone(store, input.emailId, "no-address")
    logEvent("dropped", { reason: "no-address" })
    return { next: "stop", code: "no-address" }
  }
  const { email, sid } = sender
  const context = { email, sid, ...(await domainIds(deps, email.from)), config: deps.config, store, now }
  const gates = await runGates(context, input.origin === "consent" ? RESUMED_GATES : undefined)
  if (!gates.ok) {
    if (gates.reason === "rate-global" || gates.reason === "budget") await alertOncePerDay(deps, gates.reason, email.id, now)
    if (gates.reason !== "done") await markDone(store, email.id, gates.reason)
    logEvent("dropped", { sid: sidPrefix(sid), reason: gates.reason })
    return { next: "stop", code: gates.reason }
  }
  if (!(await hasConsent(store, sid))) return { next: "consent" }
  await touchConsent(store, sid)
  return { next: "guard" }
}
