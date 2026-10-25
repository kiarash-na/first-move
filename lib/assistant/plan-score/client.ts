import type { LanguageModel } from "ai"
import { DECISION_PROVIDER_OPTIONS, type DecisionProviderOptions } from "@/lib/ai/plan-score/decide-turn"
import type { ProviderOptions } from "@/lib/ai/plan-score/report"
import type { ScoreOptions } from "@/lib/ai/plan-score/run"
import { gatewayClient } from "../gateway/client"
import { textProviderOptions } from "../gateway/models"
import { OPENROUTER_PROVIDER_OPTIONS, openRouterClient } from "../openrouter/client"
import { OPENROUTER_DECISION_MODEL_ID, openRouterDecisionModel } from "../openrouter/decision-model"
import type { Provider } from "../providers/types"

/**
 * What one AI Plan Score run needs of a provider (owner, 2026-10-25): the decision model, the
 * text model and the privacy switches of both calls. The Gateway serves the pinned Jev directly;
 * OpenRouter goes through the Jev Router adapter, so its runs record `typesafe/jev-router` and
 * are not comparable with Gateway runs (the method stays 1.1.0).
 */
export interface ScoreClient {
  decisionModel: () => ScoreOptions["decisionModel"]
  decisionProviderOptions: DecisionProviderOptions
  textModel: (id: string) => LanguageModel
  textProviderOptions: (id: string) => ProviderOptions
}

export function gatewayScoreClient(key: string, fetch?: typeof globalThis.fetch): ScoreClient {
  const client = gatewayClient(key, fetch)
  return {
    decisionModel: () => client.decisionModel(),
    decisionProviderOptions: DECISION_PROVIDER_OPTIONS,
    textModel: (id) => client.textModel(id),
    textProviderOptions,
  }
}

export function openRouterScoreClient(key: string, fetch?: typeof globalThis.fetch): ScoreClient {
  const client = openRouterClient(key, fetch)
  return {
    decisionModel: () => openRouterDecisionModel(client.chatModel(OPENROUTER_DECISION_MODEL_ID)),
    decisionProviderOptions: OPENROUTER_PROVIDER_OPTIONS,
    textModel: (id) => client.chatModel(id),
    textProviderOptions: () => OPENROUTER_PROVIDER_OPTIONS,
  }
}

/** The score client of the chosen provider, for the user's key of that provider. */
export function scoreClient(provider: Provider, key: string, fetch?: typeof globalThis.fetch): ScoreClient {
  return provider === "gateway" ? gatewayScoreClient(key, fetch) : openRouterScoreClient(key, fetch)
}
