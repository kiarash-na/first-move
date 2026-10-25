import { start } from "workflow/api"
import { mailAgentEnv } from "@/lib/mail-agent/env"
import { handleWebhook, webhookClients } from "@/lib/mail-agent/inbound/webhook"
import { humanRelay } from "@/workflows/human-relay"
import { inboundEmail } from "@/workflows/inbound-email"

/**
 * Resend's webhook for agent@ and human@ (PLAN-AGENT-06 step 5, O8), POST only. The logic lives in
 * `lib/mail-agent/inbound/webhook.ts`; `start` stays in this entrypoint, where `withWorkflow` finds it.
 */
export async function POST(request: Request) {
  return handleWebhook(request, {
    env: mailAgentEnv(),
    clients: webhookClients,
    start: (input) => start(inboundEmail, [input]),
    startRelay: (ref) => start(humanRelay, [ref]),
    now: Date.now(),
  })
}
