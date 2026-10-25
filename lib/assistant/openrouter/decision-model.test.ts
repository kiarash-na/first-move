import { MockLanguageModelV4 } from "ai/test"
import { describe, expect, it } from "vitest"
import { decideTurn } from "../../ai/plan-score/decide-turn"
import { normalizeAnswers, OPENROUTER_DECISION_MODEL_ID, openRouterDecisionModel } from "./decision-model"

const QUESTIONS = {
  j_market: {
    type: "score" as const,
    instructions: "Rate the market part.",
    criteria: ["Missing.", "Vague.", "Specific.", "Quantified.", "Evidenced."],
  },
  g_heat: { type: "boolean" as const, instructions: "Does the plan name the heat source?" },
  b_model: {
    type: "choice" as const,
    instructions: "Which model fits?",
    criteria: { escrow: "A third party bills.", owner: "The owner sells heat.", coop: "A cooperative runs it." },
  },
}

/** A chat model answering with the given JSON; `calls` counts the generations. */
function jsonModel(payload: unknown, calls?: { count: number }) {
  return new MockLanguageModelV4({
    provider: "openrouter",
    modelId: OPENROUTER_DECISION_MODEL_ID,
    doGenerate: async () => {
      if (calls) calls.count += 1
      return {
        content: [{ type: "text" as const, text: typeof payload === "string" ? payload : JSON.stringify(payload) }],
        finishReason: { unified: "stop" as const, raw: "stop" },
        usage: { inputTokens: { total: 120, noCache: 120, cacheRead: 0, cacheWrite: 0 }, outputTokens: { total: 40, text: 40, reasoning: 0 } },
        warnings: [],
      }
    },
  })
}

describe("openRouterDecisionModel", () => {
  it("implements the v4 contract: openrouter provider, no box questions", () => {
    const model = openRouterDecisionModel(jsonModel({}))
    expect(model.provider).toBe("openrouter")
    expect(model.modelId).toBe(OPENROUTER_DECISION_MODEL_ID)
    expect(model.supportedQuestionTypes).toEqual(["choice", "score", "boolean"])
  })

  it("answers every question type through decideTurn, with distributions normalized to sum 1", async () => {
    const model = openRouterDecisionModel(
      jsonModel({
        answers: {
          j_market: { type: "score", probabilities: { "0": 0, "1": 0.1, "2": 0.3, "3": 0.4, "4": 0.2 } },
          g_heat: { type: "boolean", probability: 0.8 },
          b_model: { type: "choice", probabilities: { escrow: 0.1, owner: 0.7, coop: 0.2 } },
        },
      }),
    )
    const { answers, inputTokens } = await decideTurn(model, { plan: { market: "x" } }, QUESTIONS)
    expect(inputTokens).toBe(120)
    expect(answers.g_heat).toEqual({ type: "boolean", probability: 0.8 })
    const choice = answers.b_model as { type: "choice"; choice: string; probabilities: Record<string, number> }
    expect(choice.choice).toBe("owner")
    expect(Object.values(choice.probabilities).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6)
    const score = answers.j_market as { type: "score"; score: number; probabilities: Record<string, number> }
    // The SDK's own validation accepted the answer: the score is the weighted mean of the distribution.
    expect(score.score).toBeCloseTo(0 * 0 + 1 * 0.1 + 2 * 0.3 + 3 * 0.4 + 4 * 0.2, 6)
  })

  it("clamps probabilities into [0, 1] before normalizing", () => {
    const normalized = normalizeAnswers(
      { g_heat: { type: "boolean", probability: 1.7 } },
      { g_heat: QUESTIONS.g_heat },
    )
    expect(normalized.g_heat).toEqual({ type: "boolean", probability: 1 })
  })

  it("turns an all-zero distribution into a refusal instead of an invalid answer", () => {
    const normalized = normalizeAnswers(
      { j_market: { type: "score", probabilities: { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0 } } },
      { j_market: QUESTIONS.j_market },
    )
    expect(normalized.j_market).toEqual({ type: "refusal" })
  })

  it("lets a refusal through, and decideTurn retries without the refused question", async () => {
    const asked: string[][] = []
    const model = openRouterDecisionModel(
      new MockLanguageModelV4({
        provider: "openrouter",
        modelId: OPENROUTER_DECISION_MODEL_ID,
        doGenerate: async ({ prompt }) => {
          const ids = [...JSON.stringify(prompt).matchAll(/\\?"([jgb]_[A-Za-z0-9_]+)\\?"/g)].map((match) => match[1])
          const unique = [...new Set(ids)]
          asked.push(unique)
          const answers = Object.fromEntries(
            unique.map((id) => [id, id === "g_heat" ? { type: "refusal" } : { type: "boolean", probability: 0.6 }]),
          )
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ answers }) }],
            finishReason: { unified: "stop" as const, raw: "stop" },
            usage: { inputTokens: { total: 50, noCache: 50, cacheRead: 0, cacheWrite: 0 }, outputTokens: { total: 10, text: 10, reasoning: 0 } },
            warnings: [],
          }
        },
      }),
    )
    const result = await decideTurn(model, { plan: {} }, { g_heat: QUESTIONS.g_heat, g_heat2: QUESTIONS.g_heat })
    expect(asked[0].sort()).toEqual(["g_heat", "g_heat2"])
    expect(asked[1]).toEqual(["g_heat2"])
    expect(result.answers.g_heat).toEqual({ type: "refusal" })
    expect(result.answers.g_heat2).toEqual({ type: "boolean", probability: 0.6 })
  })

  it("retries once when the answer is not the JSON the schema asks for", async () => {
    const calls = { count: 0 }
    const bad = '["not", "an", "object"]'
    const good = { answers: { g_heat: { type: "boolean", probability: 0.4 } } }
    const model = openRouterDecisionModel(
      new MockLanguageModelV4({
        provider: "openrouter",
        modelId: OPENROUTER_DECISION_MODEL_ID,
        doGenerate: async () => {
          calls.count += 1
          return {
            content: [{ type: "text" as const, text: calls.count === 1 ? bad : JSON.stringify(good) }],
            finishReason: { unified: "stop" as const, raw: "stop" },
            usage: { inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 }, outputTokens: { total: 5, text: 5, reasoning: 0 } },
            warnings: [],
          }
        },
      }),
    )
    const { answers } = await decideTurn(model, { plan: {} }, { g_heat: QUESTIONS.g_heat })
    expect(calls.count).toBe(2)
    expect(answers.g_heat).toEqual({ type: "boolean", probability: 0.4 })
  })

  it("throws what is not a malformed answer", async () => {
    const model = openRouterDecisionModel(
      new MockLanguageModelV4({
        provider: "openrouter",
        modelId: OPENROUTER_DECISION_MODEL_ID,
        doGenerate: async () => {
          throw new Error("401")
        },
      }),
    )
    await expect(decideTurn(model, { plan: {} }, { g_heat: QUESTIONS.g_heat })).rejects.toThrow("401")
  })
})
