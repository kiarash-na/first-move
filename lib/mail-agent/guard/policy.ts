import "server-only"
import type { GuardDecision, GuardResult } from "./decide"
import { THREATS, type Threat } from "./questions"
import { THRESHOLDS } from "./thresholds"

/**
 * What happens to a judged email (PLAN-AGENT-06 step 9, D-55): answer it, reply briefly to small
 * talk, count a strike and act on nothing, block the sender, or (when the guard could not judge)
 * tell the sender to try later.
 */
export type Verdict =
  | { action: "allow" }
  | { action: "small_talk" }
  | { action: "strike"; reason: "off_topic" | "suspect" }
  | { action: "block"; category: Threat }
  | { action: "unavailable" }

/** The highest threat; on equal probabilities the order of `THREATS` decides. */
function topThreat(decision: GuardDecision): [Threat, number] {
  return THREATS.map((threat) => [threat, decision[threat]] as [Threat, number]).reduce((top, next) => (next[1] > top[1] ? next : top))
}

/** The policy on Jev's numbers: threats first, then the topic. Pure, so every edge has a test. */
export function judge(decision: GuardDecision): Verdict {
  const [threat, probability] = topThreat(decision)
  if (probability >= THRESHOLDS.block) return { action: "block", category: threat }
  if (probability >= THRESHOLDS.suspect) return { action: "strike", reason: "suspect" }
  if (decision.topic === "off_topic" && decision.offTopic >= THRESHOLDS.offTopic) return { action: "strike", reason: "off_topic" }
  if (decision.topic === "small_talk") return { action: "small_talk" }
  return { action: "allow" }
}

/**
 * The verdict for a guard result. A refusal counts as suspect (the model would not judge it); a
 * failure is no evidence against the sender, so it costs no strike: the sender hears to try later.
 */
export function verdictFor(result: GuardResult): Verdict {
  if (result.ok) return judge(result.decision)
  return result.reason === "refused" ? { action: "strike", reason: "suspect" } : { action: "unavailable" }
}
