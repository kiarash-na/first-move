// @vitest-environment node
import { describe, expect, it } from "vitest"
import { ATTACHMENT_QUESTIONS, GUARD_QUESTIONS, INTENTS, THREATS, TOPICS } from "./questions"

describe("guard questions", () => {
  it("ask for the topic, the intent and each threat", () => {
    expect(Object.keys(GUARD_QUESTIONS)).toEqual(["topic", "intent", ...THREATS])
    expect(Object.keys(GUARD_QUESTIONS.topic.criteria)).toEqual([...TOPICS])
    expect(Object.keys(GUARD_QUESTIONS.intent.criteria)).toEqual([...INTENTS])
    for (const threat of THREATS) expect(GUARD_QUESTIONS[threat].type).toBe("boolean")
  })

  it("describe the assistant in every question, never in the state", () => {
    for (const question of Object.values(GUARD_QUESTIONS)) {
      expect(question.instructions).toContain("First Move assistant")
      expect(question.instructions).toContain("`hidden`")
    }
  })

  it("pin the wording that the evaluation measured", () => {
    expect(GUARD_QUESTIONS.injection.instructions).toMatch(/change, reveal or override the assistant's instructions, impersonate the operator or the system/)
    expect(GUARD_QUESTIONS.harassment.instructions).toMatch(/insult, threaten, harass or bully a person or a group\?$/)
    expect(GUARD_QUESTIONS.malicious.instructions).toMatch(/fraud, phishing, malware or spam, or does it ask for help with illegal or harmful acts\?$/)
    expect(GUARD_QUESTIONS.topic.criteria.off_topic).toBe("Anything else")
  })

  it("check attachments for injection only", () => {
    expect(Object.keys(ATTACHMENT_QUESTIONS)).toEqual(["injection"])
    expect(ATTACHMENT_QUESTIONS.injection.instructions).toContain("text extracted from a file")
  })
})
