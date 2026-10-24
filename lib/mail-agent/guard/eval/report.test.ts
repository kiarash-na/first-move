// @vitest-environment node
import { describe, expect, it } from "vitest"
import type { GuardDecision } from "../decide"
import { THRESHOLDS } from "../thresholds"
import type { EvalCase } from "./cases"
import { evalReport, formatReport } from "./report"

const quiet: GuardDecision = { topic: "first_move", offTopic: 0.05, intent: "question", injection: 0.01, harassment: 0.01, malicious: 0.01 }

function entry(id: string, expect: EvalCase["expect"], threat?: EvalCase["threat"]): EvalCase {
  return { id, lang: "en", kind: "question", subject: "s", body: "b", attachments: [], expect, ...(threat && { threat }) }
}

describe("evalReport", () => {
  it("counts outcomes per expected class and finds nothing wrong in a clean run", () => {
    const report = evalReport([
      { entry: entry("en-a-01", "allow"), decision: quiet },
      { entry: entry("en-s-01", "small_talk"), decision: { ...quiet, topic: "small_talk" } },
      { entry: entry("en-o-01", "off_topic"), decision: { ...quiet, topic: "off_topic", offTopic: 0.92 } },
    ])
    expect(report.total).toBe(3)
    expect(report.matrix.allow.allow).toBe(1)
    expect(report.matrix.small_talk.small_talk).toBe(1)
    expect(report.matrix.off_topic["strike:off_topic"]).toBe(1)
    expect(report.benignBlocked).toEqual([])
    expect(report.misses).toEqual([])
    expect(report.threatRecall).toBeNull()
    expect(report.suggested).toEqual({ block: THRESHOLDS.block, suspect: THRESHOLDS.suspect, offTopic: THRESHOLDS.offTopic })
  })

  it("names benign cases that would be blocked, and suggests a margin above them", () => {
    const report = evalReport([{ entry: entry("en-a-01", "allow"), decision: { ...quiet, injection: 0.93 } }])
    expect(report.benignBlocked).toEqual(["en-a-01"])
    expect(report.misses).toEqual(["en-a-01"])
    expect(report.suggested.block).toBe(0.98)
    expect(report.suggested.suspect).toBe(0.95)
  })

  it("raises the off-topic threshold above on-topic cases that come close", () => {
    const report = evalReport([{ entry: entry("en-a-01", "allow"), decision: { ...quiet, offTopic: 0.72 } }])
    expect(report.margins.onTopicOffTopicMax).toBe(0.72)
    expect(report.suggested.offTopic).toBe(0.77)
  })

  it("records threat recall on the case's own threat, at block and strike level", () => {
    const report = evalReport([
      { entry: entry("en-t-01", "threat", "injection"), decision: { ...quiet, injection: 0.95 } },
      { entry: entry("en-t-02", "threat", "harassment"), decision: { ...quiet, harassment: 0.7 } },
      { entry: entry("en-t-03", "threat", "malicious"), decision: { ...quiet, malicious: 0.2 } },
    ])
    expect(report.threatRecall).toEqual({ block: 1 / 3, suspect: 2 / 3 })
    expect(report.misses).toEqual(["en-t-03"])
  })

  it("counts a case Jev did not answer as no answer", () => {
    const report = evalReport([{ entry: entry("en-a-01", "allow"), decision: null }])
    expect(report.matrix.allow["no-answer"]).toBe(1)
    expect(report.misses).toEqual(["en-a-01"])
  })

  it("prints the matrix, the margins and the suggestions", () => {
    const text = formatReport(evalReport([{ entry: entry("en-a-01", "allow"), decision: quiet }]))
    expect(text).toContain("cases: 1")
    expect(text).toContain("benign blocked: none")
    expect(text).toContain("threat recall: no threat cases")
    expect(text).toMatch(/suggested: +block 0.9, suspect 0.6, offTopic 0.7/)
  })
})
