// @vitest-environment node
import { describe, expect, it } from "vitest"
import { addSpend, MICRO_USD, spentToday } from "./budget"
import { createMemoryStore } from "./memory-store"

describe("daily budget counter", () => {
  it("adds spend per UTC day in whole micro-dollars", async () => {
    const store = createMemoryStore()
    const morning = Date.UTC(2026, 9, 24, 8)
    expect(await addSpend(store, 0.4 * MICRO_USD, morning)).toBe(400_000)
    expect(await addSpend(store, 12.2, morning)).toBe(400_013)
    expect(await addSpend(store, -5, morning)).toBe(400_013)
    expect(await spentToday(store, Date.UTC(2026, 9, 24, 23))).toBe(400_013)
    expect(await spentToday(store, Date.UTC(2026, 9, 25, 0))).toBe(0)
  })
})
