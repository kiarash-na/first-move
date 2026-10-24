import { FatalError, RetryableError } from "workflow"
import type { GuardResult } from "@/lib/mail-agent/guard/decide"
import type { InboundInput, MailDeps } from "@/lib/mail-agent/pipeline/types"

/**
 * Runs one step against the live clients. The pipeline is imported inside the step, so SDK
 * clients stay out of the workflow sandbox. A busy sender retries in 15 s; a Resend error that
 * cannot pass later (validation, quota, key) and a switched-off agent end the run.
 */
async function withDeps<T>(work: (deps: MailDeps) => Promise<T>): Promise<T> {
  const [{ liveDeps }, { SenderBusyError }, { TransportError }] = await Promise.all([
    import("@/lib/mail-agent/pipeline/deps"),
    import("@/lib/mail-agent/pipeline/types"),
    import("@/lib/mail-agent/inbound/transport"),
  ])
  const deps = liveDeps()
  if (!deps) throw new FatalError("The email agent is not configured")
  try {
    return await work(deps)
  } catch (error) {
    if (error instanceof SenderBusyError) throw new RetryableError(error.message, { retryAfter: "15s" })
    if (error instanceof TransportError && !error.retryable) throw new FatalError(error.message)
    throw error
  }
}

export async function triageStep(input: InboundInput, now: number) {
  "use step"
  const { triage } = await import("@/lib/mail-agent/pipeline/triage")
  return withDeps((deps) => triage(deps, input, now))
}

export async function askConsentStep(input: InboundInput, now: number) {
  "use step"
  const { askConsent } = await import("@/lib/mail-agent/pipeline/ask-consent")
  return withDeps((deps) => askConsent(deps, input, now))
}
askConsentStep.maxRetries = 6

export async function judgeStep(input: InboundInput, now: number) {
  "use step"
  const { judgeEmail } = await import("@/lib/mail-agent/pipeline/judge")
  return withDeps((deps) => judgeEmail(deps, input, now))
}

export async function actStep(input: InboundInput, result: GuardResult, now: number) {
  "use step"
  const { act } = await import("@/lib/mail-agent/pipeline/act")
  return withDeps((deps) => act(deps, input, result, now))
}
actStep.maxRetries = 6

export async function respondStep(input: InboundInput, action: "allow" | "small_talk") {
  "use step"
  const { respond } = await import("@/lib/mail-agent/pipeline/respond")
  return withDeps((deps) => respond(deps, input, action))
}
