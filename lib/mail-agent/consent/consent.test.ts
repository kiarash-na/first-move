// @vitest-environment node
import { describe, expect, it } from "vitest"
import { keys } from "../store/keys"
import { createMemoryStore } from "../store/memory-store"
import { hasConsent, recordConsent, touchConsent } from "./consent"

const DAY = 86_400_000

describe("consent records", () => {
  it("are kept twelve months after the last message", async () => {
    let time = 0
    const store = createMemoryStore({ now: () => time })
    expect(await hasConsent(store, "sid1")).toBe(false)
    await recordConsent(store, "sid1", { at: "2026-10-24T12:00:00.000Z", terms: "1.1", privacy: "1.1" })
    expect(JSON.parse((await store.get(keys.consent("sid1")))!)).toEqual({ at: "2026-10-24T12:00:00.000Z", terms: "1.1", privacy: "1.1" })
    time = 300 * DAY
    await touchConsent(store, "sid1")
    time = 600 * DAY
    expect(await hasConsent(store, "sid1")).toBe(true)
    time = 300 * DAY + 366 * DAY
    expect(await hasConsent(store, "sid1")).toBe(false)
  })
})
