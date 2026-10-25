// @vitest-environment node
import { describe, expect, it } from "vitest"
import { z } from "zod"
import { anthropicTextModel, GATEWAY_URL } from "./anthropic"

const SCHEMA = z.strictObject({ answer: z.string().max(50) })

function message(overrides: Record<string, unknown> = {}) {
  return {
    id: "msg_1",
    type: "message",
    role: "assistant",
    model: "text-model",
    content: [{ type: "text", text: JSON.stringify({ answer: "Fifth-generation networks run at low temperature." }) }],
    stop_reason: "end_turn",
    stop_sequence: null,
    usage: { input_tokens: 1200, output_tokens: 80, cache_read_input_tokens: 100, cache_creation_input_tokens: 0 },
    ...overrides,
  }
}

/** A fetch that answers with the given bodies in turn and records each request. */
function fakeFetch(...bodies: (Record<string, unknown> | number)[]) {
  const requests: { url: string; headers: Headers; body: Record<string, unknown> }[] = []
  const fetch = async (input: string | URL | Request, init?: RequestInit) => {
    const request = new Request(input, init)
    requests.push({ url: request.url, headers: request.headers, body: JSON.parse(await request.text()) })
    const next = bodies.shift() ?? 500
    if (typeof next === "number") return new Response(JSON.stringify({ type: "error", error: { type: "api_error", message: "down" } }), { status: next })
    return new Response(JSON.stringify(next), { status: 200, headers: { "content-type": "application/json" } })
  }
  return { fetch: fetch as typeof globalThis.fetch, requests }
}

const model = (fetch: typeof globalThis.fetch) => anthropicTextModel({ apiKey: "gateway-key", model: "anthropic/text-model", fetch })
const request = { system: "You answer.", user: "What is 5GDHC?", schema: SCHEMA, maxTokens: 500 }

describe("anthropicTextModel (D-64)", () => {
  it("calls the Gateway's Messages API with structured output, low effort, Anthropic only and no sampling", async () => {
    const fake = fakeFetch(message())
    const result = await model(fake.fetch).structured(request)
    expect(result).toEqual({ ok: true, value: { answer: "Fifth-generation networks run at low temperature." }, usage: { inputTokens: 1300, outputTokens: 80 } })
    const [sent] = fake.requests
    expect(sent.url).toBe(`${GATEWAY_URL}/v1/messages`)
    // SDK 1.x sends the key as a bearer token, which the Gateway accepts; nothing else authenticates.
    expect(sent.headers.get("authorization")).toBe("Bearer gateway-key")
    expect(sent.headers.get("x-api-key")).toBeNull()
    expect(sent.body).toMatchObject({
      model: "anthropic/text-model",
      max_tokens: 500,
      system: "You answer.",
      messages: [{ role: "user", content: "What is 5GDHC?" }],
      output_config: { effort: "low", format: { type: "json_schema" } },
      providerOptions: { gateway: { only: ["anthropic"] } },
    })
    expect(JSON.stringify(sent.body)).not.toMatch(/temperature|top_p|top_k|zeroDataRetention/)
  })

  it("tries a cut-off answer once more with twice the tokens, and counts both calls", async () => {
    const fake = fakeFetch(message({ stop_reason: "max_tokens", content: [{ type: "text", text: '{"answer":"Fif' }] }), message())
    const result = await model(fake.fetch).structured(request)
    expect(result.ok).toBe(true)
    expect(fake.requests.map((sent) => sent.body.max_tokens)).toEqual([500, 1000])
    expect(result.usage).toEqual({ inputTokens: 2600, outputTokens: 160 })
  })

  it("gives up after the second cut-off", async () => {
    const cut = message({ stop_reason: "max_tokens", content: [{ type: "text", text: "{" }] })
    expect(await model(fakeFetch(cut, cut).fetch).structured(request)).toMatchObject({ ok: false, reason: "max_tokens" })
  })

  it("reports a refusal without reading the content", async () => {
    const fake = fakeFetch(message({ stop_reason: "refusal", content: [] }))
    expect(await model(fake.fetch).structured(request)).toEqual({ ok: false, reason: "refusal", usage: { inputTokens: 1300, outputTokens: 80 } })
  })

  it("reports output that breaks the schema as invalid", async () => {
    const fake = fakeFetch(message({ content: [{ type: "text", text: JSON.stringify({ answer: "x".repeat(60) }) }] }))
    expect(await model(fake.fetch).structured(request)).toMatchObject({ ok: false, reason: "invalid" })
  })

  it("reports a failure after the SDK's retries, without throwing", async () => {
    const fake = fakeFetch(400)
    expect(await model(fake.fetch).structured(request)).toEqual({ ok: false, reason: "failed", usage: { inputTokens: 0, outputTokens: 0 } })
  })
})
