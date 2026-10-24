// @vitest-environment node
import { describe, expect, it } from "vitest"
import { createMemoryStore } from "./memory-store"
import { storeContract } from "./test-utils/contract"

describe("memory store", () => {
  storeContract(() => {
    let time = 0
    const store = createMemoryStore({ now: () => time })
    return {
      store,
      advance: async (ms) => {
        time += ms
      },
    }
  }, "test:")

  it("forgets expired keys when counting its size", async () => {
    let time = 0
    const store = createMemoryStore({ now: () => time })
    await store.set("a", "1", { ttlMs: 10 })
    await store.set("b", "2")
    time = 20
    expect(store.size()).toBe(1)
  })
})
