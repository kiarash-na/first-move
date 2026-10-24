// @vitest-environment node
import { describe, expect, it } from "vitest"
import { dmarcGate } from "./dmarc"
import { testContext, testEmail } from "./test-utils/context"

describe("dmarcGate", () => {
  it.each(["fail", "gray", "unknown", "processing_failed"] as const)("drop DMARC %s silently", (dmarc) => {
    expect(dmarcGate(testContext({ email: testEmail({ authentication: { spf: "pass", dkim: "pass", dmarc } }) }))).toEqual({ ok: false, reason: "dmarc" })
  })
})
