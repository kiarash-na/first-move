// @vitest-environment node
import { describe, expect, it } from "vitest"
import { createMemoryStore } from "../store/memory-store"
import { blockedGate } from "./blocked"
import { budgetGate } from "./budget"
import { dmarcGate } from "./dmarc"
import { doneGate } from "./done"
import { loopGate } from "./loops"
import { rateLimitGate } from "./rate-limit"
import { GATES, RESUMED_GATES, runGates } from "./run-gates"
import { sizeGate } from "./size"
import { testContext, testEmail } from "./test-utils/context"

describe("runGates", () => {
  it("run in the planned order", () => {
    expect(GATES).toEqual([doneGate, dmarcGate, loopGate, blockedGate, rateLimitGate, sizeGate, budgetGate])
  })

  it("let an ordinary email through", async () => {
    expect(await runGates(testContext())).toEqual({ ok: true })
  })

  it("never count a forged email against the sender's limits", async () => {
    const context = testContext({ email: testEmail({ authentication: { spf: "fail", dkim: "fail", dmarc: "fail" } }) })
    expect(await runGates(context)).toEqual({ ok: false, reason: "dmarc" })
    expect((context.store as ReturnType<typeof createMemoryStore>).size()).toBe(0)
  })

  it("count a confirmed email once: the resumed run skips the rate limits", async () => {
    expect(RESUMED_GATES).toEqual([doneGate, dmarcGate, loopGate, blockedGate, sizeGate, budgetGate])
    const context = testContext()
    expect(await runGates(context, RESUMED_GATES)).toEqual({ ok: true })
    expect((context.store as ReturnType<typeof createMemoryStore>).size()).toBe(0)
  })
})
