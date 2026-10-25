import { FatalError } from "workflow"
import type { InboundRef } from "@/lib/mail-agent/inbound/event"

/**
 * Passes one email to human@ on to the person behind it (O8). The relay is imported inside the
 * step, so SDK clients stay out of the workflow sandbox. A Resend error that cannot pass later,
 * an incomplete configuration and a relay switched off end the run; the rest retries.
 */
export async function relayStep(ref: InboundRef, now: number) {
  "use step"
  const [{ relayDeps }, { relayToPerson }, { TransportError }] = await Promise.all([
    import("@/lib/mail-agent/relay/deps"),
    import("@/lib/mail-agent/relay/relay"),
    import("@/lib/mail-agent/inbound/transport"),
  ])
  const deps = relayDeps()
  if (!deps) throw new FatalError("The email configuration is incomplete or the human@ relay is off")
  try {
    return await relayToPerson(deps, ref, now)
  } catch (error) {
    if (error instanceof TransportError && !error.retryable) throw new FatalError(error.message)
    throw error
  }
}
relayStep.maxRetries = 6
