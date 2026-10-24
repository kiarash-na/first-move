import { expect, it } from "vitest"
import type { MailStore } from "../store"

/**
 * The behaviour every store must show, run against the memory store always and against Upstash
 * when a live run is switched on. `advance` moves time forward (real waiting for Upstash).
 */
export function storeContract(make: () => { store: MailStore; advance: (ms: number) => Promise<void> }, prefix: string) {
  const key = (name: string) => `${prefix}${name}`

  it("writes, reads and deletes", async () => {
    const { store } = make()
    expect(await store.get(key("a"))).toBeNull()
    expect(await store.set(key("a"), "1")).toBe(true)
    expect(await store.get(key("a"))).toBe("1")
    await store.del(key("a"))
    expect(await store.get(key("a"))).toBeNull()
  })

  it("writes only when absent with ifAbsent", async () => {
    const { store } = make()
    expect(await store.set(key("nx"), "first", { ifAbsent: true, ttlMs: 60_000 })).toBe(true)
    expect(await store.set(key("nx"), "second", { ifAbsent: true, ttlMs: 60_000 })).toBe(false)
    expect(await store.get(key("nx"))).toBe("first")
    await store.del(key("nx"))
  })

  it("reads and deletes in one step", async () => {
    const { store } = make()
    await store.set(key("once"), "token")
    expect(await store.getdel(key("once"))).toBe("token")
    expect(await store.getdel(key("once"))).toBeNull()
  })

  it("counts up, starting a new key at zero", async () => {
    const { store } = make()
    expect(await store.incr(key("count"), 60_000)).toBe(1)
    expect(await store.incr(key("count"), 60_000, 5)).toBe(6)
    await store.del(key("count"))
  })

  it("expires keys", async () => {
    const { store, advance } = make()
    await store.set(key("short"), "x", { ttlMs: 1_000 })
    await store.incr(key("short-count"), 1_000)
    await store.set(key("long"), "y", { ttlMs: 60_000 })
    await store.expire(key("long"), 1_000)
    await advance(1_500)
    expect(await store.get(key("short"))).toBeNull()
    expect(await store.get(key("short-count"))).toBeNull()
    expect(await store.get(key("long"))).toBeNull()
    expect(await store.incr(key("short-count"), 1_000)).toBe(1)
    await store.del(key("short-count"))
  })

  it("keeps a counter's first expiry when it counts on", async () => {
    const { store, advance } = make()
    await store.incr(key("window"), 1_000)
    await advance(600)
    await store.incr(key("window"), 1_000)
    await advance(600)
    expect(await store.get(key("window"))).toBeNull()
  })
}
