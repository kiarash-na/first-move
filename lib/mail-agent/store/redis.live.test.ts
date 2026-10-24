// @vitest-environment node
import { describe } from "vitest"
import { createRedisStore } from "./redis"
import { storeContract } from "./test-utils/contract"

/**
 * The same contract against the real Upstash database, only when switched on:
 * `MAIL_AGENT_LIVE_STORE=1 pnpm vitest run lib/mail-agent/store/redis.live.test.ts` with the
 * store variables in the environment. Keys live under a test prefix and are deleted or expire.
 */
const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
const live = process.env.MAIL_AGENT_LIVE_STORE === "1" && Boolean(url && token)

describe.skipIf(!live)("Upstash store (live)", () => {
  storeContract(
    () => ({
      store: createRedisStore({ url: url!, token: token! }),
      advance: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    }),
    `fm:test:${Date.now()}:`,
  )
}, 30_000)
