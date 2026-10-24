import "server-only"
import { logEvent } from "../log"
import { markDone } from "./sender"
import type { InboundInput, MailDeps } from "./types"

/**
 * The answer to allowed mail. Phase 07 builds the conversation here (menu, questions, extraction,
 * results); until then an allowed email is only marked done. The agent stays switched off
 * (`EMAIL_AGENT_ENABLED`) until phase 07 has shipped.
 */
export async function respond(deps: MailDeps, input: InboundInput, action: "allow" | "small_talk"): Promise<string> {
  await markDone(deps.store, input.emailId, action)
  logEvent("respond", { action, status: "not-built" })
  return action
}
