import { start } from "workflow/api"
import { confirmStore, handleConfirm } from "@/lib/mail-agent/consent/confirm"
import { mailAgentEnv } from "@/lib/mail-agent/env"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { inboundEmail } from "@/workflows/inbound-email"

/**
 * The consent click from `/[lang]/mail/confirm` (PLAN-AGENT-06 step 8), POST only. The logic lives
 * in `lib/mail-agent/consent/confirm.ts`; `start` stays in this entrypoint, where `withWorkflow` finds it.
 */
export async function POST(request: Request) {
  const [terms, privacy] = await Promise.all([getDictionary("en", "terms"), getDictionary("en", "privacy")])
  return handleConfirm(request, {
    env: mailAgentEnv(),
    store: confirmStore,
    start: (input) => start(inboundEmail, [input]),
    versions: { terms: terms.version, privacy: privacy.version },
    now: Date.now(),
  })
}
