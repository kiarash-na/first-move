// @vitest-environment node
import { describe, expect, it } from "vitest"
import { MICRO_USD } from "../store/budget"
import { keys } from "../store/keys"
import { budgetGate } from "./budget"
import { testContext } from "./test-utils/context"

describe("budgetGate", () => {
  it("pause when today's budget is spent", async () => {
    const context = testContext()
    await context.store.incr(keys.budget("2026-10-24"), 1e9, 2 * MICRO_USD)
    expect(await budgetGate(context)).toEqual({ ok: false, reason: "budget" })
    expect(await budgetGate({ ...context, now: Date.UTC(2026, 9, 25, 1) })).toEqual({ ok: true })
  })
})
