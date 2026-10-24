// No `server-only` and type imports only: the workflow sandbox runs this file (workflows/inbound-email).
import type { GuardResult } from "../guard/decide"
import type { ActResult } from "./act"
import type { TriageResult } from "./triage"
import type { InboundInput } from "./types"

/** The steps of one inbound email; in the workflow each is a durable step, in tests a plain function. */
export interface InboundSteps {
  triage(input: InboundInput, now: number): Promise<TriageResult>
  askConsent(input: InboundInput, now: number): Promise<string>
  judge(input: InboundInput, now: number): Promise<GuardResult>
  act(input: InboundInput, result: GuardResult, now: number): Promise<ActResult>
  respond(input: InboundInput, action: "allow" | "small_talk", now: number): Promise<string>
}

/**
 * One inbound email (PLAN-AGENT-06 step 6): gates and consent, then Jev, then the verdict, then
 * the answer. Steps exchange ids, codes and numbers only. `now` is fixed per run, so a step that
 * runs again writes the same email. Returns the final code.
 */
export async function inboundFlow(steps: InboundSteps, input: InboundInput, now: number): Promise<string> {
  const triaged = await steps.triage(input, now)
  if (triaged.next === "stop") return triaged.code
  if (triaged.next === "consent") return steps.askConsent(input, now)
  const judged = await steps.judge(input, now)
  const acted = await steps.act(input, judged, now)
  if (acted.next === "stop") return acted.code
  return steps.respond(input, acted.action, now)
}
