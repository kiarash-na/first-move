import "server-only"
import { Redis } from "@upstash/redis"
import type { MailStore } from "./store"

/**
 * The store contract on Upstash Redis over REST (PLAN-AGENT-06 step 4, D-56). Values stay
 * strings (no automatic JSON parsing) and the SDK sends no telemetry.
 */
export function createRedisStore({ url, token }: { url: string; token: string }): MailStore {
  const redis = new Redis({ url, token, automaticDeserialization: false, enableTelemetry: false })
  return {
    async get(key) {
      return redis.get<string>(key)
    },
    async set(key, value, { ttlMs, ifAbsent = false } = {}) {
      const options = ttlMs === undefined ? (ifAbsent ? { nx: true as const } : undefined) : ifAbsent ? { px: ttlMs, nx: true as const } : { px: ttlMs }
      const result = options ? await redis.set(key, value, options) : await redis.set(key, value)
      return result === "OK"
    },
    async getdel(key) {
      return redis.getdel<string>(key)
    },
    async del(key) {
      await redis.del(key)
    },
    async incr(key, ttlMs, by = 1) {
      // One transaction: a new key gets its expiry first, so a counter never outlives its window.
      const [, value] = await redis.multi().set(key, "0", { nx: true, px: ttlMs }).incrby(key, by).exec<[unknown, number]>()
      return Number(value)
    },
    async expire(key, ttlMs) {
      await redis.pexpire(key, ttlMs)
    },
  }
}
