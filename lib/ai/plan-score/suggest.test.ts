import { describe, expect, it } from "vitest"
import { getExample, localizeExample } from "@/lib/examples"
import { AI_SCORE_LIMITS } from "@/lib/project"
import { scorePlan } from "./run"
import { SUGGESTIONS_MAX_OUTPUT_TOKENS, suggestionTargets, suggestPrompt, writeSuggestions } from "./suggest"
import { germanText } from "./test-utils/german-text"
import { mockJev } from "./test-utils/mock-jev"
import { MOCK_CHARS_PER_TOKEN, mockText, mockThinkingText } from "./test-utils/mock-text"

const now = () => new Date("2026-10-24T12:00:00.000Z")
const project = localizeExample(getExample("housing-cooperatives")!, "en")
const scored = async () =>
  (await scorePlan(project, { decisionModel: mockJev({ levels: { financing: [0.5, 0.5, 0, 0, 0], subsidies: [0, 1, 0, 0, 0] }, gates: { "cost-key": 0.5, operator: 0.05 } }).model, now })).score

describe("suggestions on demand (D-77)", () => {
  it("targets weak judgements and failed or unclear gates", async () => {
    const score = await scored()
    expect(suggestionTargets(score)).toEqual(["financing", "subsidies", "operator", "cost-key"])
    expect(suggestionTargets(score, ["operator"])).toEqual(["operator"])
  })

  it("grounds the prompt in what a strong answer contains and the sourced hints", () => {
    const { system, prompt } = suggestPrompt(project, ["financing", "operator"], "en")
    expect(system).toContain("Do not invent")
    expect(prompt).toContain("indication from a lender")
    expect(prompt).toContain("Draw the system boundary")
  })

  it("keeps only asked keys, at most three texts each, and merges with earlier suggestions", async () => {
    const score = await scored()
    const model = mockText({
      items: [
        { key: "financing", suggestions: ["Ask the municipality about infrastructure loans.", "a", "b", "c"] },
        { key: "unknown", suggestions: ["x"] },
        { key: "operator", suggestions: [""] },
      ],
    })
    const first = await writeSuggestions(project, score, { model, modelId: "m", lang: "en", keys: ["financing", "operator"], now })
    expect(first.value.items).toEqual([{ key: "financing", texts: ["Ask the municipality about infrastructure loans.", "a", "b"] }])
    const again = await writeSuggestions(project, { ...score, suggestions: first.value }, { model: mockText({ items: [{ key: "subsidies", suggestions: ["Show the case without a subsidy."] }] }), modelId: "m", lang: "en", keys: ["subsidies"], now })
    expect(again.value.items.map((item) => item.key)).toEqual(["financing", "subsidies"])
  })

  it("accepts long German suggestions from a thinking model within the cap, cut to the stored limits", async () => {
    const score = await scored()
    const keys = suggestionTargets(score)
    const long = { items: keys.map((key, index) => ({ key, suggestions: [0, 1, 2].map((offset) => germanText(AI_SCORE_LIMITS.item + 40, index + offset)) })) }
    const answer = Math.ceil(JSON.stringify(long).length / MOCK_CHARS_PER_TOKEN)
    // More thought than the whole old cap of 2,500 tokens, and the answer still fits.
    const reasoning = SUGGESTIONS_MAX_OUTPUT_TOKENS - answer - 100
    expect(reasoning).toBeGreaterThan(2_500)
    const model = mockThinkingText(long, { reasoning })
    const { value, tokens } = await writeSuggestions(project, score, { model, modelId: "m", lang: "de", now })
    expect(model.doGenerateCalls[0].maxOutputTokens).toBe(SUGGESTIONS_MAX_OUTPUT_TOKENS)
    expect(tokens).toBe(900 + reasoning + answer)
    expect(value.lang).toBe("de")
    expect(value.items.map((item) => item.key)).toEqual(keys)
    for (const item of value.items) {
      expect(item.texts).toHaveLength(AI_SCORE_LIMITS.suggestions)
      for (const text of item.texts) expect(text.length).toBeLessThanOrEqual(AI_SCORE_LIMITS.item)
    }
  })

  it("asks nothing when nothing is weak", async () => {
    const strong = (await scorePlan(project, { decisionModel: mockJev({ levels: {} }).model, now })).score
    const model = mockText({ items: [] })
    const result = await writeSuggestions(project, { ...strong, gates: strong.gates.filter((gate) => gate.outcome === "pass") }, { model, modelId: "m", lang: "en", now })
    expect(result.tokens).toBe(0)
    expect(model.doGenerateCalls).toHaveLength(0)
  })
})
