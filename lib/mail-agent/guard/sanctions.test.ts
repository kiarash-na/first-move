// @vitest-environment node
import { describe, expect, it } from "vitest"
import { blockedGate } from "../gates/blocked"
import { testContext } from "../gates/test-utils/context"
import { keys } from "../store/keys"
import { createMemoryStore } from "../store/memory-store"
import { addStrike, applyVerdict } from "./sanctions"

const DAY = 86_400_000
const offTopic = { action: "strike", reason: "off_topic" } as const

describe("sanctions (D-55)", () => {
  it("warn on the first strike and ban for 30 days on the second", async () => {
    let time = 0
    const store = createMemoryStore({ now: () => time })
    expect(await applyVerdict(store, "sid1", "e1", offTopic, time)).toBe("warning")
    expect(await store.get(keys.ban("sid1"))).toBeNull()
    time = 10 * DAY
    expect(await applyVerdict(store, "sid1", "e2", { action: "strike", reason: "suspect" }, time)).toBe("ban")
    expect((await blockedGate(testContext({ sid: "sid1", now: time }, store))).ok).toBe(false)
    time = 40 * DAY + 1
    expect((await blockedGate(testContext({ sid: "sid1", now: time }, store))).ok).toBe(true)
    expect(await applyVerdict(store, "sid1", "e3", offTopic, time)).toBe("ban")
  })

  it("count each email once, so a repeated step cannot ban", async () => {
    const store = createMemoryStore()
    expect(await addStrike(store, "sid1", "e1")).toBe(1)
    expect(await addStrike(store, "sid1", "e1")).toBe(1)
    expect(await applyVerdict(store, "sid1", "e1", offTopic, 0)).toBe("warning")
  })

  it("forget strikes 90 days after the latest", async () => {
    let time = 0
    const store = createMemoryStore({ now: () => time })
    await addStrike(store, "sid1", "e1")
    time = 91 * DAY
    expect(await applyVerdict(store, "sid1", "e2", offTopic, time)).toBe("warning")
  })

  it("block for good, with the category and time only", async () => {
    let time = 0
    const store = createMemoryStore({ now: () => time })
    expect(await applyVerdict(store, "sid1", "e1", { action: "block", category: "injection" }, time)).toBe("block")
    expect(JSON.parse((await store.get(keys.block("sid1")))!)).toEqual({ category: "injection", at: "1970-01-01T00:00:00.000Z" })
    time = 5_000 * DAY
    expect(await blockedGate(testContext({ sid: "sid1", now: time }, store))).toEqual({ ok: false, reason: "blocked" })
  })

  it("send no notice for allowed mail and tell the sender when the guard failed", async () => {
    const store = createMemoryStore()
    expect(await applyVerdict(store, "sid1", "e1", { action: "allow" }, 0)).toBeNull()
    expect(await applyVerdict(store, "sid1", "e1", { action: "small_talk" }, 0)).toBeNull()
    expect(await applyVerdict(store, "sid1", "e1", { action: "unavailable" }, 0)).toBe("unavailable")
    expect(store.size()).toBe(0)
  })
})
