// @vitest-environment node
import { describe, expect, it } from "vitest"
import { keys } from "../store/keys"
import { blockedGate } from "./blocked"
import { testContext } from "./test-utils/context"

describe("blockedGate", () => {
  it("drop blocked and banned senders", async () => {
    const context = testContext()
    await context.store.set(keys.ban("sid-jane"), "1")
    expect(await blockedGate(context)).toEqual({ ok: false, reason: "banned" })
    await context.store.set(keys.block("sid-jane"), "1")
    expect(await blockedGate(context)).toEqual({ ok: false, reason: "blocked" })
  })
})
