import type { InboundRef } from "@/lib/mail-agent/inbound/event"
import { relayStep } from "./steps"

/** One email to human@ (O8), started by the webhook: ids only, the step fetches the email. */
export async function humanRelay(ref: InboundRef) {
  "use workflow"
  return relayStep(ref, Date.now())
}
