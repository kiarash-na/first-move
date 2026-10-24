// @vitest-environment node
import { describe, expect, it } from "vitest"
import { keys } from "./keys"
import { withSenderLock } from "./lock"
import { createMemoryStore } from "./memory-store"

describe("withSenderLock", () => {
  it("runs the work and releases the lock", async () => {
    const store = createMemoryStore()
    expect(await withSenderLock(store, "sid1", async () => 42)).toEqual({ ok: true, value: 42 })
    expect(await store.get(keys.lock("sid1"))).toBeNull()
  })

  it("refuses while another run holds the lock, for that sender only", async () => {
    const store = createMemoryStore()
    let inner: unknown
    await withSenderLock(store, "sid1", async () => {
      inner = await withSenderLock(store, "sid1", async () => "never")
      expect(await withSenderLock(store, "sid2", async () => "other")).toEqual({ ok: true, value: "other" })
    })
    expect(inner).toEqual({ ok: false })
  })

  it("releases on errors, and never releases a lock that is no longer its own", async () => {
    let time = 0
    const store = createMemoryStore({ now: () => time })
    await expect(withSenderLock(store, "sid1", async () => Promise.reject(new Error("boom")))).rejects.toThrow("boom")
    expect(await store.get(keys.lock("sid1"))).toBeNull()

    await withSenderLock(store, "sid1", async () => {
      time += 130_000
      await store.set(keys.lock("sid1"), "someone-else")
    })
    expect(await store.get(keys.lock("sid1"))).toBe("someone-else")
  })
})
