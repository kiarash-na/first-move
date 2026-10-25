import type { LanguageModel } from "ai"
import type { ProviderOptions } from "@/lib/ai/plan-score/report"
import { gatewayClient } from "../gateway/client"
import { textProviderOptions } from "../gateway/models"
import { OPENROUTER_PROVIDER_OPTIONS, openRouterClient } from "../openrouter/client"
import type { Provider } from "./types"

type Fetch = typeof globalThis.fetch

/** The chosen model through the chosen provider, with the user's key (browser → provider). */
export function assistantModel(provider: Provider, key: string, modelId: string, fetch?: Fetch): LanguageModel {
  return provider === "gateway" ? gatewayClient(key, fetch).textModel(modelId) : openRouterClient(key, fetch).chatModel(modelId)
}

/**
 * Privacy options per request: on the Gateway zero data retention where the catalogue lists it
 * and never training (as for the AI Plan Score); on OpenRouter only providers that do not collect
 * the data.
 */
export function assistantProviderOptions(provider: Provider, modelId: string): ProviderOptions {
  return provider === "gateway" ? textProviderOptions(modelId) : OPENROUTER_PROVIDER_OPTIONS
}
