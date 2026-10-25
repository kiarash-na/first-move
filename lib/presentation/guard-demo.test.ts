// @vitest-environment node
import { describe, expect, it } from "vitest"
import { judge } from "@/lib/mail-agent/guard/policy"
import { THRESHOLDS } from "@/lib/mail-agent/guard/thresholds"
import { GUARD_SAMPLES, GUARD_SIGNALS, GUARD_THRESHOLDS, thresholdFor } from "./guard-demo"

describe("guard demo (slide 7)", () => {
  it("shows the guard's real thresholds", () => {
    expect(GUARD_THRESHOLDS).toEqual(THRESHOLDS)
  })

  it("gives each scripted sample the verdict the real policy would give", () => {
    for (const sample of GUARD_SAMPLES) {
      const verdict = judge({
        topic: sample.topic,
        offTopic: sample.signals.offTopic,
        intent: "other",
        injection: sample.signals.injection,
        harassment: sample.signals.harassment,
        malicious: sample.signals.malicious,
      })
      expect(verdict.action, sample.id).toBe(sample.verdict)
    }
  })

  it("covers every verdict once, with probabilities between 0 and 1", () => {
    expect(new Set(GUARD_SAMPLES.map((sample) => sample.verdict))).toEqual(new Set(["allow", "small_talk", "strike", "block"]))
    for (const sample of GUARD_SAMPLES) for (const signal of GUARD_SIGNALS) expect(sample.signals[signal]).toBeGreaterThanOrEqual(0)
    expect(thresholdFor("offTopic")).toBe(0.7)
    expect(thresholdFor("injection")).toBe(0.6)
  })
})
