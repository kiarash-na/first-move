import type { ProviderOptions } from "@/lib/ai/plan-score/report"
/**
 * Text models for the report and the suggestions (D-71: model-agnostic through the AI Gateway).
 * Prices per million tokens as listed in the Gateway catalogue on 2026-10-24; `zdr` says whether
 * the catalogue lists a zero-data-retention route, so the request may ask for one. Any other
 * Gateway model id can be typed in.
 */
export interface TextModel {
  id: string
  name: string
  /** USD per million input and output tokens. */
  price: { input: number; output: number }
  zdr: boolean
}

export const TEXT_MODELS: readonly TextModel[] = [
  { id: "anthropic/claude-sonnet-5.5", name: "Claude Sonnet 5.5", price: { input: 2, output: 10 }, zdr: true },
  { id: "anthropic/claude-haiku-5.5", name: "Claude Haiku 5.5", price: { input: 0.1, output: 0.5 }, zdr: true },
  { id: "anthropic/claude-opus-5.5", name: "Claude Opus 5.5", price: { input: 4, output: 20 }, zdr: true },
  { id: "openai/gpt-6.1-sol", name: "GPT-6.1 Sol", price: { input: 2, output: 10 }, zdr: true },
  { id: "google/gemini-4-argon", name: "Gemini 4 Argon", price: { input: 2, output: 10 }, zdr: true },
  { id: "mistral/mistral-large-4", name: "Mistral Large 4", price: { input: 1.36, output: 4.18 }, zdr: true },
  { id: "deepseek/deepseek-v4-pro", name: "DeepSeek V4 Pro", price: { input: 0.66, output: 1.98 }, zdr: true },
]

export const DEFAULT_TEXT_MODEL = TEXT_MODELS[0].id

/** A Gateway model id: `creator/model`, lower case letters, digits, dots and hyphens. */
export function isModelId(value: string): boolean {
  return /^[a-z0-9-]{2,40}\/[a-z0-9][a-z0-9.-]{1,80}$/.test(value.trim())
}

/** Gateway options for a text request: ZDR where the catalogue lists it, never training on prompts. */
export function textProviderOptions(modelId: string): ProviderOptions {
  const known = TEXT_MODELS.find((model) => model.id === modelId)
  return { gateway: known?.zdr ? { zeroDataRetention: true, disallowPromptTraining: true } : { disallowPromptTraining: true } }
}
