import { generateText, NoObjectGeneratedError, Output } from "ai"
import { describe, expect, it } from "vitest"
import { getExample, localizeExample } from "@/lib/examples"
import { AI_SCORE_LIMITS } from "@/lib/project"
import { REPORT_MAX_OUTPUT_TOKENS, reportOutputSchema, reportPrompt, toReport, weakJudgements, writeReport } from "./report"
import { scorePlan } from "./run"
import { germanText } from "./test-utils/german-text"
import { mockJev } from "./test-utils/mock-jev"
import { MOCK_CHARS_PER_TOKEN, mockText, mockThinkingText } from "./test-utils/mock-text"

const now = () => new Date("2026-10-24T12:00:00.000Z")
const project = localizeExample(getExample("housing-cooperatives")!, "en")
const scored = async () => (await scorePlan(project, { decisionModel: mockJev({ levels: { financing: [0.5, 0.5, 0, 0, 0] } }).model, now })).score

describe("the report (PLAN-AI-SCORE-00 step 4)", () => {
  it("gives the text model the final numbers and the plan only as untrusted excerpts", async () => {
    const score = await scored()
    const { system, prompt } = reportPrompt(project, score, "de")
    expect(system).toContain("German")
    expect(system).toContain("are final")
    expect(prompt).toContain('"label":"promising"')
    expect(prompt).toMatch(/<untrusted_document name="business-plan">[\s\S]*Mixed-ownership housing district/)
  })

  it("keeps pointers to real keys only and cuts texts to the stored limits", () => {
    const report = toReport(
      {
        headline: "x".repeat(400),
        summary: "A solid start.",
        strengths: [{ text: "Clear sites.", keys: ["site", "not-a-key", "site"] }, { text: " ", keys: [] }],
        gaps: [{ text: "No deal-breaker validation.", keys: ["deal-breaker"] }],
        actions: ["Ask the water authority.", "", "Survey owners.", "Draft a cost key.", "Fourth"],
      },
      "anthropic/claude-sonnet-5.5",
      "en",
    )
    expect(report.headline.length).toBeLessThanOrEqual(160)
    expect(report.strengths).toEqual([{ text: "Clear sites.", keys: ["site"] }])
    expect(report.gaps[0].keys).toEqual(["deal-breaker"])
    expect(report.actions).toHaveLength(3)
  })

  it("writes the report with any language model and counts its tokens", async () => {
    const score = await scored()
    const model = mockText({ headline: "Promising, with gaps in financing.", summary: "The plan is specific.", strengths: [], gaps: [{ text: "Financing is vague.", keys: ["financing"] }], actions: ["Ask a bank."] })
    const { value, tokens } = await writeReport(project, score, { model, modelId: "openai/gpt-6.1-sol", lang: "en" })
    expect(value).toMatchObject({ model: "openai/gpt-6.1-sol", lang: "en", headline: "Promising, with gaps in financing." })
    expect(tokens).toBe(1200)
    expect(model.doGenerateCalls[0].responseFormat).toMatchObject({ type: "json" })
  })

  it("accepts a long German report from a thinking model within the cap, cut to the stored limits", async () => {
    const score = await scored()
    const point = (seed: number) => ({ text: germanText(AI_SCORE_LIMITS.item + 60, seed), keys: ["financing", "deal-breaker"] })
    const long = {
      headline: germanText(AI_SCORE_LIMITS.headline + 40, 1),
      summary: germanText(AI_SCORE_LIMITS.text + 200, 2),
      strengths: [point(3), point(4), point(5)],
      gaps: [point(6), point(7), point(8)],
      actions: [germanText(AI_SCORE_LIMITS.item, 9), germanText(AI_SCORE_LIMITS.item, 10), germanText(AI_SCORE_LIMITS.item, 11)],
    }
    const answer = Math.ceil(JSON.stringify(long).length / MOCK_CHARS_PER_TOKEN)

    // The old cap of 1,500 cut this answer off after 1,000 tokens of thought (blind test, run 1).
    const old = mockThinkingText(long, { reasoning: 1_000 })
    const cut = await generateText({ model: old, prompt: "x", output: Output.object({ schema: reportOutputSchema }), maxOutputTokens: 1_500 }).catch((error: unknown) => error)
    expect(NoObjectGeneratedError.isInstance(cut) && cut.finishReason).toBe("length")

    // The engine's cap leaves room for far more thought before the same answer.
    const reasoning = REPORT_MAX_OUTPUT_TOKENS - answer - 100
    expect(reasoning).toBeGreaterThan(4_000)
    const model = mockThinkingText(long, { reasoning })
    const { value, tokens } = await writeReport(project, score, { model, modelId: "example/text-model", lang: "de" })
    expect(model.doGenerateCalls[0].maxOutputTokens).toBe(REPORT_MAX_OUTPUT_TOKENS)
    expect(tokens).toBe(900 + reasoning + answer)
    expect(value.lang).toBe("de")
    expect(value.headline.length).toBeLessThanOrEqual(AI_SCORE_LIMITS.headline)
    expect(value.summary.length).toBeLessThanOrEqual(AI_SCORE_LIMITS.text)
    expect(value.summary).toMatch(/…$/)
    expect(value.strengths).toHaveLength(3)
    expect(value.gaps.every((gap) => gap.text.length <= AI_SCORE_LIMITS.item)).toBe(true)
    expect(value.actions).toHaveLength(3)
  })

  it("finds the weak judgements", async () => {
    expect(weakJudgements(await scored())).toEqual(["financing"])
  })
})
