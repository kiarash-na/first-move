// @vitest-environment node
import { describe, expect, it } from "vitest"
import { keys } from "../store/keys"
import { createMemoryStore } from "../store/memory-store"
import { loadOutbox, saveOutbox } from "./outbox"

const SECRET = new Uint8Array(32).fill(5)

describe("outbox", () => {
  it("keeps a reply sealed until it is sent, for a day", async () => {
    const clock = { now: Date.UTC(2026, 9, 25) }
    const store = createMemoryStore({ now: () => clock.now })
    const reply = { emailId: "email-1", kind: "stopped", locale: "de" as const, text: "Conversation ended", html: "<p>Conversation ended</p>" }
    await saveOutbox(store, SECRET, reply)
    expect(await store.get(keys.outbox("email-1"))).not.toContain("Conversation")
    expect(await loadOutbox(store, SECRET, "email-1")).toEqual(reply)
    clock.now += 86_400_001
    expect(await loadOutbox(store, SECRET, "email-1")).toBeNull()
  })

  it("reads nothing for another email or a broken record", async () => {
    const store = createMemoryStore()
    await store.set(keys.outbox("email-2"), "v1.x.y")
    expect(await loadOutbox(store, SECRET, "email-2")).toBeNull()
    expect(await loadOutbox(store, SECRET, "email-3")).toBeNull()
  })
})
