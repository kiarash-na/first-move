import { DEFAULT_TEXT_MODEL, isModelId, TEXT_MODELS } from "../gateway/models"
import { DEFAULT_OPENROUTER_MODEL, isOpenRouterModelId, OPENROUTER_MODELS } from "../openrouter/models"
import type { Provider } from "./types"

/** A model the assistant offers: catalogue entries per provider, plus any id typed in. */
export interface AssistantModel {
  id: string
  name: string
  price: { input: number; output: number } | null
}

export const ASSISTANT_MODELS: Record<Provider, readonly AssistantModel[]> = {
  gateway: TEXT_MODELS.map(({ id, name, price }) => ({ id, name, price })),
  openrouter: OPENROUTER_MODELS,
}

export const DEFAULT_MODEL: Record<Provider, string> = {
  gateway: DEFAULT_TEXT_MODEL,
  openrouter: DEFAULT_OPENROUTER_MODEL,
}

export const isModelIdFor: Record<Provider, (value: string) => boolean> = {
  gateway: isModelId,
  openrouter: isOpenRouterModelId,
}
