import "server-only"
import type { AlertDeps } from "../admin/alert"
import { mailAgentEnv } from "../env"
import { resendTransport } from "../inbound/transport"
import { createRedisStore } from "../store/redis"

let cached: AlertDeps | undefined

/**
 * The clients the human@ relay needs: Upstash and Resend, no model. It runs whenever the
 * configuration is complete, also while the AI agent is switched off: human@ is a person's
 * address, not the agent's. Null when the configuration is incomplete.
 */
export function relayDeps(): AlertDeps | null {
  const env = mailAgentEnv()
  if (env.status === "incomplete") return null
  cached ??= { config: env.config, store: createRedisStore(env.config.store), transport: resendTransport(env.config.resend.apiKey) }
  return cached
}
