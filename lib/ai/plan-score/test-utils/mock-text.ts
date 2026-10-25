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
