import "server-only"
import type { z } from "zod"

/** Tokens one call used; cache reads and writes count as input. */
export interface TokenUsage {
  inputTokens: number
  outputTokens: number
}

export const NO_USAGE: TokenUsage = { inputTokens: 0, outputTokens: 0 }

export interface StructuredRequest<T> {
  system: string
  user: string
  /** The output's shape; the model is constrained to it and the result is checked against it. */
  schema: z.ZodType<T>
  /** The first attempt's limit; a cut-off answer is tried once more with twice as much. */
  maxTokens: number
}

export type StructuredResult<T> =
  | { ok: true; value: T; usage: TokenUsage }
  /** `refusal`: the model declined. `max_tokens`: still cut off on the retry. `invalid`: not the schema. `failed`: no answer. */
  | { ok: false; reason: "refusal" | "max_tokens" | "invalid" | "failed"; usage: TokenUsage }

/** The language model the email agent writes and reads with (Claude Haiku, D-52, D-64); tests pass a fake. */
export interface TextModel {
  /** The model id, as recorded in a value's provenance. */
  readonly modelId: string
  structured<T>(request: StructuredRequest<T>): Promise<StructuredResult<T>>
}

/**
 * Claude Haiku 5.5's price in USD per million tokens: $0.10 in, $0.50 out for prompts up to
 * 100K tokens, five times that above (research note). The agent's prompts stay far below.
 */
export const HAIKU_PRICE = { input: 0.1, output: 0.5, longInput: 0.5, longOutput: 2.5, longFrom: 100_000 } as const

/** Micro-dollars for one call's usage, for the daily budget. */
export function textCost({ inputTokens, outputTokens }: TokenUsage): number {
  const long = inputTokens > HAIKU_PRICE.longFrom
  return inputTokens * (long ? HAIKU_PRICE.longInput : HAIKU_PRICE.input) + outputTokens * (long ? HAIKU_PRICE.longOutput : HAIKU_PRICE.output)
}

export const addUsage = (a: TokenUsage, b: TokenUsage): TokenUsage => ({ inputTokens: a.inputTokens + b.inputTokens, outputTokens: a.outputTokens + b.outputTokens })
