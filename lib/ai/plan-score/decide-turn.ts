import {
  experimental_decide,
  Experimental_DecisionRefusalError,
  type Experimental_DecisionModel,
  type Experimental_DecisionQuestion,
  type Experimental_DecisionState,
} from "ai"

/**
 * One Jev call for one turn (PLAN-AI-SCORE-00 § Method). A question Jev declines is retried
 * once without the declined ones, so one refusal never sinks a turn; declined questions come
 * back as `refusal`. Every other error is thrown for the run to report.
 */
export type DecisionAnswer =
  | { type: "score"; score: number; probabilities?: Record<string, number> }
  | { type: "boolean"; probability: number }
  | { type: "choice"; choice: string; probabilities?: Record<string, number> }
  | { type: "refusal" }

export interface TurnAnswers {
  answers: Record<string, DecisionAnswer>
  inputTokens: number
}

/** The Gateway routes only to providers that keep no data and do not train on prompts (Jev 1.14.0 has both). */
export const DECISION_PROVIDER_OPTIONS = { gateway: { zeroDataRetention: true, disallowPromptTraining: true } }
const TIMEOUT_MS = 60_000

/** When a provider reports no usage: about three characters a token, questions included. */
const estimate = (state: Experimental_DecisionState, questions: object) => Math.ceil((JSON.stringify(state).length + JSON.stringify(questions).length) / 3)

async function ask(model: Experimental_DecisionModel, state: Experimental_DecisionState, questions: Record<string, Experimental_DecisionQuestion>, abortSignal?: AbortSignal) {
  const signal = abortSignal ? AbortSignal.any([abortSignal, AbortSignal.timeout(TIMEOUT_MS)]) : AbortSignal.timeout(TIMEOUT_MS)
  const result = await experimental_decide({ model, state, questions, maxRetries: 2, abortSignal: signal, providerOptions: DECISION_PROVIDER_OPTIONS })
  return {
    answers: result.answers as Record<string, DecisionAnswer>,
    inputTokens: result.usage.inputTokens ?? estimate(state, questions),
  }
}

export async function decideTurn(
  model: Experimental_DecisionModel,
  state: Experimental_DecisionState,
  questions: Record<string, Experimental_DecisionQuestion>,
  abortSignal?: AbortSignal,
): Promise<TurnAnswers> {
  if (Object.keys(questions).length === 0) return { answers: {}, inputTokens: 0 }
  try {
    return await ask(model, state, questions, abortSignal)
  } catch (error) {
    if (!Experimental_DecisionRefusalError.isInstance(error)) throw error
    const refused = new Set(error.questionIds)
    const rest = Object.fromEntries(Object.entries(questions).filter(([id]) => !refused.has(id)))
    const declined = Object.fromEntries([...refused].map((id) => [id, { type: "refusal" as const }]))
    if (Object.keys(rest).length === 0) return { answers: declined, inputTokens: 0 }
    const again = await ask(model, state, rest, abortSignal).catch((retryError: unknown) => {
      if (!Experimental_DecisionRefusalError.isInstance(retryError)) throw retryError
      return { answers: Object.fromEntries(Object.keys(rest).map((id) => [id, { type: "refusal" as const }])), inputTokens: 0 }
    })
    return { answers: { ...again.answers, ...declined }, inputTokens: again.inputTokens }
  }
}
