import "server-only"

/**
 * The few key-value operations the email agent needs (PLAN-AGENT-06 step 4), so Upstash Redis
 * and the in-memory store share one contract. Values are strings; encrypted records are sealed
 * before they get here.
 */
export interface MailStore {
  get(key: string): Promise<string | null>
  /** Writes the value; with `ifAbsent`, only when the key does not exist. Returns whether it wrote. */
  set(key: string, value: string, options?: { ttlMs?: number; ifAbsent?: boolean }): Promise<boolean>
  /** Reads and deletes in one step (single-use tokens). */
  getdel(key: string): Promise<string | null>
  del(key: string): Promise<void>
  /** Adds `by` (default 1) and returns the new value; a new key gets `ttlMs`, an existing one keeps its expiry. */
  incr(key: string, ttlMs: number, by?: number): Promise<number>
  /** Sets a new expiry on an existing key. */
  expire(key: string, ttlMs: number): Promise<void>
}
