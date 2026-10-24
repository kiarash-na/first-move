// @vitest-environment node
import { describe, expect, it } from "vitest"
import { createMemoryStore } from "./memory-store"
import { hitRate, rateRules } from "./ratelimit"

const HOUR = 3_600_000
const rules = rateRules({ senderPerHour: 10, senderPerDay: 30, globalPerDay: 500 })

describe("hitRate (sliding window)", () => {
  it("allows up to the limit within a window, then refuses", async () => {
    const store = createMemoryStore()
    const now = 10 * HOUR
    for (let hit = 1; hit <= 10; hit++) expect((await hitRate(store, rules.senderHour, "sid1", now)).allowed).toBe(true)
    expect(await hitRate(store, rules.senderHour, "sid1", now)).toEqual({ allowed: false, estimate: 11 })
    expect((await hitRate(store, rules.senderHour, "sid2", now)).allowed).toBe(true)
  })

  it("weights the previous window by how much of it still overlaps", async () => {
    let time = 10 * HOUR
    const store = createMemoryStore({ now: () => time })
    for (let hit = 0; hit < 10; hit++) await hitRate(store, rules.senderHour, "sid1", time)
    time = 11 * HOUR + HOUR / 2
    expect(await hitRate(store, rules.senderHour, "sid1", time)).toEqual({ allowed: true, estimate: 6 })
    time = 12 * HOUR + 1
    expect((await hitRate(store, rules.senderHour, "sid1", time)).estimate).toBeCloseTo(2, 3)
  })

  it("takes the counts from the environment, and the domain limit from the plan", () => {
    expect(rules).toMatchObject({
      senderHour: { limit: 10, windowMs: HOUR },
      senderDay: { limit: 30 },
      domainDay: { limit: 100 },
      globalDay: { limit: 500 },
    })
  })
})
