import "server-only"
import type { MailStore } from "./store"

interface Entry {
  value: string
  expiresAt: number | null
}

/**
 * The store contract in memory (PLAN-AGENT-06 step 4): for tests and for local work without
 * Upstash. Expiry follows the injected clock, so tests can move time forward.
 */
export function createMemoryStore({ now = () => Date.now() }: { now?: () => number } = {}): MailStore & { size(): number } {
  const entries = new Map<string, Entry>()

  const live = (key: string): Entry | undefined => {
    const entry = entries.get(key)
    if (entry && entry.expiresAt !== null && entry.expiresAt <= now()) {
      entries.delete(key)
      return undefined
    }
    return entry
  }
  const expiry = (ttlMs?: number) => (ttlMs === undefined ? null : now() + ttlMs)

  return {
    async get(key) {
      return live(key)?.value ?? null
    },
    async set(key, value, { ttlMs, ifAbsent = false } = {}) {
      if (ifAbsent && live(key)) return false
      entries.set(key, { value, expiresAt: expiry(ttlMs) })
      return true
    },
    async getdel(key) {
      const value = live(key)?.value ?? null
      entries.delete(key)
      return value
    },
    async del(key) {
      entries.delete(key)
    },
    async incr(key, ttlMs, by = 1) {
      const entry = live(key)
      const value = (entry ? Number(entry.value) : 0) + by
      entries.set(key, { value: String(value), expiresAt: entry ? entry.expiresAt : expiry(ttlMs) })
      return value
    },
    async expire(key, ttlMs) {
      const entry = live(key)
      if (entry) entry.expiresAt = expiry(ttlMs)
    },
    size() {
      for (const key of [...entries.keys()]) live(key)
      return entries.size
    },
  }
}
