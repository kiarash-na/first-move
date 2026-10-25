import { describe, expect, it } from "vitest"
import { getExample, localizeExample } from "@/lib/examples"
import { reportPrompt, toReport, weakJudgements, writeReport } from "./report"
import { scorePlan } from "./run"
import { mockJev } from "./test-utils/mock-jev"
import { mockText } from "./test-utils/mock-text"

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

  it("finds the weak judgements", async () => {
    expect(weakJudgements(await scored())).toEqual(["financing"])
  })
})
