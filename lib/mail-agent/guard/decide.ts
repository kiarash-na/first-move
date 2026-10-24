import "server-only"
import { experimental_decide, Experimental_DecisionRefusalError, type Experimental_DecisionModel } from "ai"
import { ATTACHMENT_QUESTIONS, GUARD_QUESTIONS, type Intent, type Topic } from "./questions"
import type { GuardState } from "./state"

/** Jev's numbers for one email: codes and probabilities only, so they may pass between steps. */
export interface GuardDecision {
  topic: Topic
  /** P(off_topic). */
  offTopic: number
  intent: Intent
  injection: number
  harassment: number
  malicious: number
}

/** `refused`: Jev declined to judge. `failed`: no valid answer after the SDK's retries. */
export type GuardResult = { ok: true; decision: GuardDecision; inputTokens: number } | { ok: false; reason: "refused" | "failed" }

/** Jev's price on the AI Gateway: input tokens only, no output charge (research note). */
export const JEV_USD_PER_MILLION_INPUT = 0.042

/** Micro-dollars for a decision of this many input tokens. */
export const decisionCost = (inputTokens: number) => inputTokens * JEV_USD_PER_MILLION_INPUT

/** The Gateway routes only to providers that keep no data and do not train on prompts. */
const PROVIDER_OPTIONS = { gateway: { zeroDataRetention: true, disallowPromptTraining: true } }
const TIMEOUT_MS = 20_000

/** When a provider reports no usage: about three characters a token, questions included. */
const estimateTokens = (state: object, questions: object) => Math.ceil((JSON.stringify(state).length + JSON.stringify(questions).length) / 3)

/** The probability of one option; without a distribution, the chosen option counts as certain. */
function probabilityOf(answer: { choice: string; probabilities?: Record<string, number> }, option: string): number {
  return answer.probabilities?.[option] ?? (answer.choice === option ? 1 : 0)
}

/** The guard's call to Jev (D-52). Any error is a result, never thrown: the policy decides what follows. */
export async function decideGuard(model: Experimental_DecisionModel, state: GuardState): Promise<GuardResult> {
  try {
    const result = await experimental_decide({
      model,
      state,
      questions: GUARD_QUESTIONS,
      maxRetries: 2,
      abortSignal: AbortSignal.timeout(TIMEOUT_MS),
      providerOptions: PROVIDER_OPTIONS,
    })
    const { topic, intent, injection, harassment, malicious } = result.answers
    return {
      ok: true,
      decision: {
        topic: topic.choice,
        offTopic: probabilityOf(topic, "off_topic"),
        intent: intent.choice,
        injection: injection.probability,
        harassment: harassment.probability,
        malicious: malicious.probability,
      },
      inputTokens: result.usage.inputTokens ?? estimateTokens(state, GUARD_QUESTIONS),
    }
  } catch (error) {
    return { ok: false, reason: Experimental_DecisionRefusalError.isInstance(error) ? "refused" : "failed" }
  }
}

/** P(injection) for text extracted from an attachment (phase 07); null when Jev gives no answer. */
export async function decideAttachment(model: Experimental_DecisionModel, text: string): Promise<{ injection: number; inputTokens: number } | null> {
  const state = { text }
  try {
    const result = await experimental_decide({
      model,
      state,
      questions: ATTACHMENT_QUESTIONS,
      maxRetries: 2,
      abortSignal: AbortSignal.timeout(TIMEOUT_MS),
      providerOptions: PROVIDER_OPTIONS,
    })
    return { injection: result.answers.injection.probability, inputTokens: result.usage.inputTokens ?? estimateTokens(state, ATTACHMENT_QUESTIONS) }
  } catch {
    return null
  }
}
