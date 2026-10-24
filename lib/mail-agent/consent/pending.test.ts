// @vitest-environment node
import { describe, expect, it } from "vitest"
import { keys } from "../store/keys"
import { createMemoryStore } from "../store/memory-store"
import { addPending, pendingOf, removePending } from "./pending"

const secret = new Uint8Array(32).fill(2)
const ref = (emailId: string) => ({ emailId, threadId: `t-${emailId}`, inboxId: "inbox-agent" })
const DAY = 86_400_000

describe("pending emails", () => {
  it("keeps up to three per sender, once each, sealed", async () => {
    const store = createMemoryStore()
    expect(await addPending(store, secret, "sid1", ref("e1"), 1_000)).toBe("added")
    expect(await addPending(store, secret, "sid1", ref("e1"), 2_000)).toBe("known")
    expect(await addPending(store, secret, "sid1", ref("e2"), 3_000)).toBe("added")
    expect(await addPending(store, secret, "sid1", ref("e3"), 4_000)).toBe("added")
    expect(await addPending(store, secret, "sid1", ref("e4"), 5_000)).toBe("full")
    expect(await store.get(keys.pending("sid1"))).toMatch(/^v1\./)
    expect(await store.get(keys.pending("sid1"))).not.toContain("e1")
  })

  it("lists them oldest first and forgets only the started ones", async () => {
    const store = createMemoryStore()
    await addPending(store, secret, "sid1", ref("e2"), 2_000)
    await addPending(store, secret, "sid1", ref("e1"), 1_000)
    expect(await pendingOf(store, secret, "sid1", 3_000)).toEqual([
      { ...ref("e1"), at: 1_000 },
      { ...ref("e2"), at: 2_000 },
    ])
    await removePending(store, secret, "sid1", ["e1"], 3_000)
    expect((await pendingOf(store, secret, "sid1", 3_000)).map((entry) => entry.emailId)).toEqual(["e2"])
    await removePending(store, secret, "sid1", ["e2"], 3_000)
    expect(store.size()).toBe(0)
  })

  it("forgets emails older than seven days", async () => {
    const store = createMemoryStore()
    await addPending(store, secret, "sid1", ref("old"), 0)
    await addPending(store, secret, "sid1", ref("new"), 6 * DAY)
    expect((await pendingOf(store, secret, "sid1", 7 * DAY + 1)).map((entry) => entry.emailId)).toEqual(["new"])
  })
})
