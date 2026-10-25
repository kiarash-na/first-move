import "server-only"
import Anthropic from "@anthropic-ai/sdk"
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod"
import { addUsage, NO_USAGE, type StructuredRequest, type StructuredResult, type TextModel, type TokenUsage } from "./model"

/** The AI Gateway's Anthropic Messages API (D-64). */
export const GATEWAY_URL = "https://ai-gateway.vercel.sh"

/**
 * Anthropic is the only processor behind the Gateway (D-64). No `zeroDataRetention`: with it
 * the Gateway skips the owner's BYOK key unless that key is marked ZDR-compliant.
 */
export const GATEWAY_OPTIONS = { gateway: { only: ["anthropic"] } } as const

const TIMEOUT_MS = 60_000

export interface AnthropicTextModelOptions {
  apiKey: string
  model: string
  /** Injected in tests. */
  fetch?: typeof fetch
}

function usageOf(message: Anthropic.Message): TokenUsage {
  const { input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens } = message.usage
  return { inputTokens: input_tokens + (cache_creation_input_tokens ?? 0) + (cache_read_input_tokens ?? 0), outputTokens: output_tokens }
}

/**
 * Claude Haiku through the Vercel AI Gateway with the official SDK (D-52, D-64): structured
 * output from a Zod schema (`output_config.format`), effort `low`, no sampling parameters. The
 * stop reason is checked before the content: a refusal ends the call (the caller falls back to
 * a fixed text), a cut-off answer is tried once more with twice the tokens. Usage is returned in
 * every case, so the daily budget counts what was spent. Errors are results, never thrown.
 */
export function anthropicTextModel({ apiKey, model, fetch }: AnthropicTextModelOptions): TextModel {
  // `authToken: null` and an explicit `baseURL`: never pick up ANTHROPIC_* variables of the host.
  const client = new Anthropic({ apiKey, authToken: null, baseURL: GATEWAY_URL, timeout: TIMEOUT_MS, maxRetries: 2, ...(fetch && { fetch }) })
  return {
    modelId: model,
    async structured<T>({ system, user, schema, maxTokens }: StructuredRequest<T>): Promise<StructuredResult<T>> {
      const format = zodOutputFormat(schema)
      let usage = NO_USAGE
      let limit = maxTokens
      for (let attempt = 0; attempt < 2; attempt++) {
        let message: Anthropic.Message
        try {
          const params = {
            model,
            max_tokens: limit,
            system,
            messages: [{ role: "user", content: user }],
            output_config: { effort: "low", format: { type: "json_schema", schema: format.schema } },
            providerOptions: GATEWAY_OPTIONS,
          } as Anthropic.MessageCreateParamsNonStreaming
          message = await client.messages.create(params)
        } catch {
          return { ok: false, reason: "failed", usage }
        }
        usage = addUsage(usage, usageOf(message))
        if (message.stop_reason === "refusal") return { ok: false, reason: "refusal", usage }
        if (message.stop_reason === "max_tokens") {
          limit *= 2
          continue
        }
        const text = message.content.map((block) => (block.type === "text" ? block.text : "")).join("")
        try {
          return { ok: true, value: format.parse(text) as T, usage }
        } catch {
          return { ok: false, reason: "invalid", usage }
        }
      }
      return { ok: false, reason: "max_tokens", usage }
    },
  }
}
