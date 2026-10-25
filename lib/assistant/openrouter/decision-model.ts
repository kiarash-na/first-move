import { generateObject, NoObjectGeneratedError, type Experimental_DecisionModel, type Experimental_DecisionQuestion, type LanguageModel } from "ai"
import { z } from "zod"
import type { DecisionProviderOptions } from "../../ai/plan-score/decide-turn"

/**
 * The OpenRouter decision model of the AI Plan Score (owner, 2026-10-25): OpenRouter has no
 * decision API and does not carry the pinned `typesafe-ai/jev-1.14.0` of the Gateway, so this
 * adapter answers the same questions through chat completions with the Jev Router, which runs on
 * Jev but picks the effort itself. Runs through it record `decisionModel: "typesafe/jev-router"`
 * and are not comparable with Gateway runs; the method stays 1.1.0.
 */
export const OPENROUTER_DECISION_MODEL_ID = "typesafe/jev-router"

/** The SDK exports only the union `Experimental_DecisionModel`; this adapter implements its v4 piece. */
export type OpenRouterDecisionModel = Exclude<Experimental_DecisionModel, string>

/** The state parts of a decision call (the v4 contract's, read loosely: the plan score sends one JSON part). */
type StatePart = { type: "text"; text: string } | { type: "json"; value: unknown } | { type: "file"; data: unknown; mediaType: string }

interface DecideOptions {
  state: readonly StatePart[]
  questions: Readonly<Record<string, Experimental_DecisionQuestion>>
  maxOutputTokens?: number
  abortSignal?: AbortSignal
  providerOptions?: DecisionProviderOptions
}

const refusal = z.object({ type: z.literal("refusal") })
const probability = z.number().describe("A finite probability in [0, 1].")

/** The JSON shape the chat model answers in, per question: a distribution (or a refusal), never a bare value. */
function answerSchema(question: Experimental_DecisionQuestion) {
  switch (question.type) {
    case "boolean":
      return z.union([z.object({ type: z.literal("boolean"), probability }), refusal])
    case "score": {
      const levels = Object.fromEntries(question.criteria.map((_, index) => [String(index), probability]))
      return z.union([z.object({ type: z.literal("score"), probabilities: z.object(levels) }), refusal])
    }
    case "choice": {
      const options = Object.fromEntries(Object.keys(question.criteria).map((option) => [option, probability]))
      return z.union([z.object({ type: z.literal("choice"), probabilities: z.object(options) }), refusal])
    }
    // "box" is never asked: supportedQuestionTypes excludes it.
    default:
      return refusal
  }
}

export function answersSchema(questions: Readonly<Record<string, Experimental_DecisionQuestion>>) {
  return z.object({ answers: z.object(Object.fromEntries(Object.entries(questions).map(([id, question]) => [id, answerSchema(question)]))) })
}

type RawAnswers = z.infer<ReturnType<typeof answersSchema>>["answers"]

/**
 * The decision prompt (method surface, like `CONTEXT` in `lib/ai/plan-score/questions.ts`): the
 * chat model stands in for the decision API, so the instructions carry what the API would
 * enforce — one calibrated distribution per question, refusal when the state cannot answer.
 */
export function decisionPrompt(state: readonly StatePart[], questions: Readonly<Record<string, Experimental_DecisionQuestion>>): { system: string; prompt: string } {
  const system =
    "You are a decision engine. Judge each question against the shared state and answer with one JSON object " +
    'of the shape {"answers": {"<question id>": <answer>}} and nothing else — one answer for every question id, ' +
    "in the question's own type:\n" +
    '- "boolean": {"type": "boolean", "probability": <P(true), a number in [0, 1]>}\n' +
    '- "score": {"type": "score", "probabilities": {"0": <p>, ..., "<n-1>": <p>}} — a calibrated distribution ' +
    "over all n levels of the criteria (lowest first); the probabilities sum to 1.\n" +
    '- "choice": {"type": "choice", "probabilities": {"<option>": <p>, ...}} — a distribution over every option; ' +
    "the probabilities sum to 1.\n" +
    "Judge only from the state; what it does not state counts as missing. When a question cannot be judged " +
    'from the state at all, answer {"type": "refusal"} for it. No text outside the JSON.'
  const stateText = state
    .map((part) => {
      if (part.type === "text") return part.text
      if (part.type === "json") return JSON.stringify(part.value)
      // The plan score's state never holds files; a file cannot be read here, so say so in place.
      return "[a file this decision model cannot read]"
    })
    .join("\n\n")
  const asked = Object.fromEntries(
    Object.entries(questions).map(([id, question]) => [
      id,
      { type: question.type, instructions: "instructions" in question ? (question.instructions ?? null) : null, criteria: "criteria" in question ? question.criteria : null },
    ]),
  )
  return { system, prompt: `State:\n${stateText}\n\nQuestions:\n${JSON.stringify(asked)}` }
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

/** Clamps to [0, 1] and rescales to sum 1; null when nothing usable came back (counts as a refusal). */
function normalize(values: number[]): number[] | null {
  const clamped = values.map(clamp01)
  const sum = clamped.reduce((total, value) => total + value, 0)
  if (!Number.isFinite(sum) || sum <= 0) return null
  return clamped.map((value) => value / sum)
}

/**
 * Turns the chat answer into exactly valid decision answers: distributions are normalized to sum
 * 1, the score is the probability-weighted mean and the choice its highest-probability option, so
 * the SDK's answer validation always passes. An unusable distribution becomes a refusal, which
 * `decideTurn` then retries without.
 */
export function normalizeAnswers(raw: RawAnswers, questions: Readonly<Record<string, Experimental_DecisionQuestion>>) {
  return Object.fromEntries(
    Object.entries(questions).map(([id, question]) => {
      const answer = raw[id]
      if (!answer || answer.type === "refusal") return [id, { type: "refusal" as const }]
      switch (question.type) {
        case "boolean": {
          const value = answer.type === "boolean" && Number.isFinite(answer.probability) ? clamp01(answer.probability) : null
          return [id, value === null ? { type: "refusal" as const } : { type: "boolean" as const, probability: value }]
        }
        case "score": {
          const levels = question.criteria.map((_, index) => String(index))
          const rawProbabilities = answer.type === "score" ? answer.probabilities : undefined
          const probabilities = rawProbabilities ? normalize(levels.map((level) => rawProbabilities[level])) : null
          if (!probabilities) return [id, { type: "refusal" as const }]
          const score = probabilities.reduce((total, value, index) => total + index * value, 0)
          return [id, { type: "score" as const, score, probabilities: Object.fromEntries(levels.map((level, index) => [level, probabilities[index]])) }]
        }
        case "choice": {
          const options = Object.keys(question.criteria)
          const rawProbabilities = answer.type === "choice" ? answer.probabilities : undefined
          const probabilities = rawProbabilities ? normalize(options.map((option) => rawProbabilities[option])) : null
          if (!probabilities) return [id, { type: "refusal" as const }]
          const best = probabilities.indexOf(Math.max(...probabilities))
          return [id, { type: "choice" as const, choice: options[best], probabilities: Object.fromEntries(options.map((option, index) => [option, probabilities[index]])) }]
        }
        default:
          return [id, { type: "refusal" as const }]
      }
    }),
  )
}

/** Output cap of one decision call: the JSON of a turn stays small, but the router may reason first. */
const MAX_OUTPUT_TOKENS = 8_000

/**
 * A `Experimental_DecisionModelV4` over an OpenRouter chat model: one `generateObject` per turn,
 * retried once when the answer is not the JSON the schema asks for (a router can switch models
 * between turns, and one malformed answer never sinks a turn — `decideTurn` handles refusals).
 */
export function openRouterDecisionModel(model: LanguageModel, modelId: string = OPENROUTER_DECISION_MODEL_ID): OpenRouterDecisionModel {
  async function decideOnce(options: DecideOptions) {
    const { system, prompt } = decisionPrompt(options.state, options.questions)
    const result = await generateObject({
      model,
      schema: answersSchema(options.questions),
      system,
      prompt,
      maxOutputTokens: options.maxOutputTokens ?? MAX_OUTPUT_TOKENS,
      abortSignal: options.abortSignal,
      providerOptions: options.providerOptions,
    })
    return {
      answers: normalizeAnswers(result.object.answers, options.questions),
      usage: { inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens },
      warnings: [],
      response: { modelId },
    }
  }

  return {
    specificationVersion: "v4",
    provider: "openrouter",
    modelId,
    supportedQuestionTypes: ["choice", "score", "boolean"],
    doDecide: async (options: DecideOptions) => {
      try {
        return await decideOnce(options)
      } catch (error) {
        if (!NoObjectGeneratedError.isInstance(error)) throw error
        return decideOnce(options)
      }
    },
  }
}
