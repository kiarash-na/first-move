import { describe, expect, it } from "vitest"
import { DECISION_PROVIDER_OPTIONS } from "@/lib/ai/plan-score/decide-turn"
import { mockJev } from "@/lib/ai/plan-score/test-utils/mock-jev"
import { mockText } from "@/lib/ai/plan-score/test-utils/mock-text"
import { getExample, localizeExample } from "@/lib/examples"
import type { ScoreClient } from "./client"
import { runAnalysis, suggest } from "./run-analysis"

const now = () => new Date("2026-10-24T12:00:00.000Z")
const project = localizeExample(getExample("housing-cooperatives")!, "en")
const REPORT = { headline: "Promising.", summary: "Specific plan.", strengths: [], gaps: [], actions: [] }

function client(text: ReturnType<typeof mockText> | "fail", jev = mockJev()): ScoreClient {
  return {
    decisionModel: () => jev.model,
    decisionProviderOptions: DECISION_PROVIDER_OPTIONS,
    textModel: () => {
      if (text === "fail") throw Object.assign(new Error("402"), { statusCode: 402 })
      return text
    },
    textProviderOptions: () => ({}),
  }
}

describe("runAnalysis (browser, D-71)", () => {
  it("scores with Jev, then writes the report with the chosen model", async () => {
    const { score, reportError } = await runAnalysis(project, { client: client(mockText(REPORT)), textModelId: "anthropic/claude-haiku-5.5", lang: "de", now })
    expect(reportError).toBeNull()
    expect(score.report).toMatchObject({ model: "anthropic/claude-haiku-5.5", lang: "de", headline: "Promising." })
    expect(score.usage).toEqual({ decisionTokens: 4000, textTokens: 1200 })
  })

  it("keeps the score when the report fails", async () => {
    const { score, reportError } = await runAnalysis(project, { client: client("fail"), textModelId: "x/y", lang: "en", now })
    expect(reportError).toBe("credits")
    expect(score.report).toBeNull()
    expect(score.judgements.length).toBeGreaterThan(0)
  })

  it("adds suggestions on demand", async () => {
    const jev = mockJev({ levels: { financing: [1, 0, 0, 0, 0] } })
    const { score } = await runAnalysis(project, { client: client(mockText(REPORT), jev), textModelId: "m/x", lang: "en", now })
    const next = await suggest(project, score, { client: client(mockText({ items: [{ key: "financing", suggestions: ["Ask a bank for an indication."] }] }), jev), textModelId: "m/x", lang: "en", now })
    expect(next.suggestions?.items).toEqual([{ key: "financing", texts: ["Ask a bank for an indication."] }])
    expect(next.usage.textTokens).toBe(2400)
  })
})
