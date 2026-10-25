/**
 * OpenRouter models for the assistant: the Auto Router by default, and a few strong models with
 * tool use. Prices per million tokens as listed by `GET /api/v1/models` on 2026-10-25 (the Auto
 * Router bills the model it picks). Any other OpenRouter model id with tool use can be typed in.
 */
export interface OpenRouterModel {
  id: string
  name: string
  /** USD per million input and output tokens; null when it depends on the routed model. */
  price: { input: number; output: number } | null
}

export const OPENROUTER_MODELS: readonly OpenRouterModel[] = [
  { id: "openrouter/auto", name: "Auto Router", price: null },
  { id: "anthropic/claude-sonnet-5.5", name: "Claude Sonnet 5.5", price: { input: 2, output: 10 } },
  { id: "anthropic/claude-haiku-5.5", name: "Claude Haiku 5.5", price: { input: 0.1, output: 0.5 } },
  { id: "openai/gpt-6.1-sol", name: "GPT-6.1 Sol", price: { input: 2, output: 10 } },
  { id: "google/gemini-4-argon", name: "Gemini 4 Argon", price: { input: 2, output: 10 } },
]

export const DEFAULT_OPENROUTER_MODEL = OPENROUTER_MODELS[0].id

/** An OpenRouter model id: `creator/model`, optionally with a `:variant`. */
export function isOpenRouterModelId(value: string): boolean {
  return /^[a-z0-9-]{2,40}\/[a-z0-9][a-z0-9._-]{0,100}(?::[a-z0-9-]{1,20})?$/.test(value.trim())
}
