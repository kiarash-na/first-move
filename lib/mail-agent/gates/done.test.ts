// @vitest-environment node
import { describe, expect, it } from "vitest"
import { keys } from "../store/keys"
import { doneGate } from "./done"
import { testContext } from "./test-utils/context"

describe("doneGate", () => {
  it("drop an email that was already handled", async () => {
    const context = testContext()
    await context.store.set(keys.done("email-1"), "1")
    expect(await doneGate(context)).toEqual({ ok: false, reason: "done" })
  })
})
