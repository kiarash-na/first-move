import { inboundFlow } from "@/lib/mail-agent/pipeline/flow"
import type { InboundInput } from "@/lib/mail-agent/pipeline/types"
import { actStep, askConsentStep, judgeStep, respondStep, triageStep } from "./steps"

/**
 * One email to agent@ (PLAN-AGENT-06 step 6), started by the webhook or by the confirm link.
 * `Date.now()` is fixed for the run, so every step and every retry sees the same time.
 */
export async function inboundEmail(input: InboundInput) {
  "use workflow"
  return inboundFlow(
    { triage: triageStep, askConsent: askConsentStep, judge: judgeStep, act: actStep, respond: respondStep },
    input,
    Date.now(),
  )
}
