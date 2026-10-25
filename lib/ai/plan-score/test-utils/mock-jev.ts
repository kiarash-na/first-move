import { Experimental_DecisionMockModelV4 } from "ai/test"
import { BRANCHES } from "../branches"
import { GATES } from "../gates"

type Call = Parameters<Experimental_DecisionMockModelV4["doDecide"]>[0]

export interface MockJevAnswers {
  /** Level distribution per judgement id (5 numbers); default: all on level 2. */
  levels?: Record<string, number[]>
  /** P(true) per boolean gate id; default 0.9. For choice gates: the chosen option id. */
  gates?: Record<string, number | string>
  /** Chosen option per branch id; default the first option. */
  branches?: Record<string, string>
  /** Judgement, gate or branch ids Jev declines. */
  refuse?: readonly string[]
  fail?: boolean
  inputTokens?: number
}

/** The id behind a question id: `j_cost_basis` → `cost-basis`. */
const named = (questionId: string) => questionId.slice(2).replace(/_/g, "-")

/** Tests only: a Jev that answers each question type from `answers`, and records every call. */
export function mockJev(answers: MockJevAnswers = {}) {
  const calls: Call[] = []
  const model = new Experimental_DecisionMockModelV4({
    provider: "test",
    modelId: "jev-test",
    doDecide: async (options) => {
      calls.push(options)
      if (answers.fail) throw new Error("gateway down")
      const result = Object.fromEntries(
        Object.entries(options.questions).map(([id, question]) => {
          const name = named(id)
          if (answers.refuse?.includes(name)) return [id, { type: "refusal" as const }]
          if (question.type === "score") {
            const levels = answers.levels?.[name] ?? [0, 0, 1, 0, 0]
            const probabilities = Object.fromEntries(levels.map((p, level) => [String(level), p]))
            return [id, { type: "score" as const, score: levels.reduce((sum, p, level) => sum + p * level, 0), probabilities }]
          }
          if (question.type === "boolean") {
            const value = answers.gates?.[name]
            return [id, { type: "boolean" as const, probability: typeof value === "number" ? value : 0.9 }]
          }
          const options = id.startsWith("b_") ? BRANCHES.find((branch) => branch.id === name)!.options : GATES.find((gate) => gate.id === name)!.options!
          const wanted = id.startsWith("b_") ? answers.branches?.[name] : answers.gates?.[name]
          const choice = typeof wanted === "string" ? wanted : options[0].id
          const probabilities = Object.fromEntries(options.map((option) => [option.id, option.id === choice ? 0.9 : 0.1 / (options.length - 1)]))
          return [id, { type: "choice" as const, choice, probabilities }]
        }),
      )
      return { answers: result, usage: { inputTokens: answers.inputTokens ?? 1000 }, warnings: [] }
    },
  })
  return { model, calls }
}
