import "server-only"
import { mailAgentEnv } from "../env"
import { decisionModel } from "../guard/model"
import { resendTransport } from "../inbound/transport"
import { createRedisStore } from "../store/redis"
import type { MailDeps } from "./types"

let cached: MailDeps | undefined

/** The real clients from the environment: Upstash, Resend and Jev; null unless the agent is ready. */
export function liveDeps(): MailDeps | null {
  const env = mailAgentEnv()
  if (env.status !== "ready") return null
  cached ??= {
    config: env.config,
    store: createRedisStore(env.config.store),
    transport: resendTransport(env.config.resend.apiKey),
    decisionModel: decisionModel(env.config),
  }
  return cached
}
