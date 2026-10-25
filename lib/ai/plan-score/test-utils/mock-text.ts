import { MockLanguageModelV4 } from "ai/test"

/** Tests only: a text model that answers every call with `output` as JSON, and records the calls. */
export function mockText(output: unknown, tokens = { input: 900, output: 300 }) {
  return new MockLanguageModelV4({
    provider: "test",
    modelId: "text-test",
    doGenerate: async () => ({
      content: [{ type: "text", text: JSON.stringify(output) }],
      finishReason: { unified: "stop", raw: "stop" },
      usage: {
        inputTokens: { total: tokens.input, noCache: tokens.input, cacheRead: 0, cacheWrite: 0 },
        outputTokens: { total: tokens.output, text: tokens.output, reasoning: 0 },
      },
      warnings: [],
    }),
  })
}

/** Characters per output token of the thinking mock: German runs at about three. */
export const MOCK_CHARS_PER_TOKEN = 3

/**
 * Tests only: a text model that thinks before it answers, like the Gateway's text models. Its
 * `reasoning` tokens count against the call's `maxOutputTokens` before the answer does, and
 * the answer takes one token per `MOCK_CHARS_PER_TOKEN` characters. When the cap is reached, the
 * answer is cut where the cap falls and the call ends with the finish reason "length", as a
 * real provider does.
 */
export function mockThinkingText(output: unknown, { reasoning, input = 900 }: { reasoning: number; input?: number }) {
  return new MockLanguageModelV4({
    provider: "test",
    modelId: "text-thinking-test",
    doGenerate: async ({ maxOutputTokens }) => {
      const answer = JSON.stringify(output)
      const needed = Math.ceil(answer.length / MOCK_CHARS_PER_TOKEN)
      const cap = maxOutputTokens ?? Number.POSITIVE_INFINITY
      const thought = Math.min(reasoning, cap)
      const written = Math.max(0, Math.min(needed, cap - thought))
      const cut = written < needed
      return {
        content: [{ type: "text", text: cut ? answer.slice(0, written * MOCK_CHARS_PER_TOKEN) : answer }],
        finishReason: cut ? { unified: "length", raw: "max_tokens" } : { unified: "stop", raw: "stop" },
        usage: {
          inputTokens: { total: input, noCache: input, cacheRead: 0, cacheWrite: 0 },
          outputTokens: { total: thought + written, text: written, reasoning: thought },
        },
        warnings: [],
      }
    },
  })
}
