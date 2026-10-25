import "server-only"
import type { Experimental_DecisionModel } from "ai"
import type { MailAgentConfig } from "../env"
import type { MailTransport } from "../inbound/transport"
import type { MailStore } from "../store/store"
import type { TextModel } from "../text/model"

/**
 * What one workflow run carries (PLAN-AGENT-06 step 6): Resend ids and where the run came from,
 * never content. Each step fetches the email again. `consent` marks a run started by the confirm
 * link for an email that waited; it counted against the limits when it arrived.
 */
export interface InboundInput {
  emailId: string
  threadId: string
  inboxId: string
  origin: "webhook" | "consent"
}

/** Everything a step needs from outside; tests pass the memory store, a fake Resend, a mock Jev and a fake text model. */
export interface MailDeps {
  config: MailAgentConfig
  store: MailStore
  transport: MailTransport
  decisionModel: Experimental_DecisionModel
  /** Writes answers and reads values (D-64); only after Jev allowed the email. */
  textModel: TextModel
}

/** Another email of the same sender holds the lock; the step tries again shortly. */
export class SenderBusyError extends Error {
  constructor() {
    super("Another email of this sender is being processed")
    this.name = "SenderBusyError"
  }
}
