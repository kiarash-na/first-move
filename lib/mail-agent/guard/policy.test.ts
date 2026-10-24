// @vitest-environment node
import { describe, expect, it } from "vitest"
import type { GuardDecision } from "./decide"
import { judge, verdictFor } from "./policy"

const safe: GuardDecision = { topic: "first_move", offTopic: 0.05, intent: "question", injection: 0.01, harassment: 0.01, malicious: 0.01 }
const with_ = (change: Partial<GuardDecision>) => judge({ ...safe, ...change })

describe("guard policy", () => {
  it("allows a safe email about First Move", () => {
    expect(judge(safe)).toEqual({ action: "allow" })
  })

  it("blocks at P >= 0.9 and names the highest threat", () => {
    expect(with_({ injection: 0.9 })).toEqual({ action: "block", category: "injection" })
    expect(with_({ injection: 0.91, malicious: 0.97 })).toEqual({ action: "block", category: "malicious" })
    expect(with_({ harassment: 0.95, malicious: 0.95 })).toEqual({ action: "block", category: "harassment" })
  })

  it("strikes a suspect email at 0.6 <= P < 0.9", () => {
    expect(with_({ harassment: 0.899 })).toEqual({ action: "strike", reason: "suspect" })
    expect(with_({ malicious: 0.6 })).toEqual({ action: "strike", reason: "suspect" })
    expect(with_({ malicious: 0.599 })).toEqual({ action: "allow" })
  })

  it("strikes off-topic mail only at P(off_topic) >= 0.7", () => {
    expect(with_({ topic: "off_topic", offTopic: 0.7 })).toEqual({ action: "strike", reason: "off_topic" })
    expect(with_({ topic: "off_topic", offTopic: 0.69 })).toEqual({ action: "allow" })
  })

  it("lets threats outrank the topic", () => {
    expect(with_({ topic: "off_topic", offTopic: 0.99, injection: 0.92 })).toEqual({ action: "block", category: "injection" })
    expect(with_({ topic: "small_talk", injection: 0.7 })).toEqual({ action: "strike", reason: "suspect" })
  })

  it("answers small talk briefly", () => {
    expect(with_({ topic: "small_talk", offTopic: 0.1 })).toEqual({ action: "small_talk" })
  })

  it("treats a refusal as suspect and a failure as unavailable", () => {
    expect(verdictFor({ ok: false, reason: "refused" })).toEqual({ action: "strike", reason: "suspect" })
    expect(verdictFor({ ok: false, reason: "failed" })).toEqual({ action: "unavailable" })
    expect(verdictFor({ ok: true, decision: safe, inputTokens: 1 })).toEqual({ action: "allow" })
  })
})
