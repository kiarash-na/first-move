import "server-only"
import type { AlertDeps } from "../admin/alert"
import { mailAgentEnv } from "../env"
import { resendTransport } from "../inbound/transport"
import { createRedisStore } from "../store/redis"

let cached: AlertDeps | undefined

/**
 * The clients the human@ relay needs: Upstash and Resend, no model. It runs only when its own
 * switch `EMAIL_HUMAN_RELAY_ENABLED` is on, independent of the AI agent's: human@ is a person's
 * address, not the agent's. Null when the configuration is incomplete or the relay is off.
 */
export function relayDeps(): AlertDeps | null {
  const env = mailAgentEnv()
  if (env.status === "incomplete" || !env.config.humanRelay) return null
  cached ??= { config: env.config, store: createRedisStore(env.config.store), transport: resendTransport(env.config.resend.apiKey) }
  return cached
}
