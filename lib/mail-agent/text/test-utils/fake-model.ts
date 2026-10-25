import type { StructuredRequest, StructuredResult, TextModel } from "../model"

/** What the fake answers for one request: a value (checked against the schema), or a failure reason. */
export type FakeAnswer = unknown | { fail: "refusal" | "max_tokens" | "invalid" | "failed" }

const USAGE = { inputTokens: 2_000, outputTokens: 300 }

/**
 * A Claude Haiku stand-in for tests: `answer` decides per request (by its system prompt, say),
 * the value is parsed with the request's schema like the real client does, and every request is
 * recorded so a test can check what the model was shown.
 */
export function fakeTextModel(answer: (request: StructuredRequest<unknown>) => FakeAnswer) {
  const requests: StructuredRequest<unknown>[] = []
  const model: TextModel = {
    modelId: "anthropic/claude-haiku-test",
    async structured<T>(request: StructuredRequest<T>): Promise<StructuredResult<T>> {
      requests.push(request as StructuredRequest<unknown>)
      const value = answer(request as StructuredRequest<unknown>)
      if (value && typeof value === "object" && "fail" in value) return { ok: false, reason: (value as { fail: "refusal" }).fail, usage: USAGE }
      const parsed = request.schema.safeParse(value)
      return parsed.success ? { ok: true, value: parsed.data, usage: USAGE } : { ok: false, reason: "invalid", usage: USAGE }
    },
  }
  return { model, requests }
}
