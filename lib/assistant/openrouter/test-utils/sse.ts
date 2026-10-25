/**
 * Tests only: OpenAI-compatible chat completion streams, as OpenRouter sends them, so the
 * assistant runs end to end against a mocked `fetch`.
 */
type Delta = { content?: string; tool_calls?: { index: number; id?: string; type?: "function"; function: { name?: string; arguments: string } }[] }

const chunk = (delta: Delta, finish: string | null = null, usage?: object) =>
  `data: ${JSON.stringify({ id: "gen-1", object: "chat.completion.chunk", created: 1792900000, model: "openrouter/auto", choices: [{ index: 0, delta, finish_reason: finish }], ...(usage && { usage }) })}\n\n`

const USAGE = { prompt_tokens: 120, completion_tokens: 30, total_tokens: 150 }

export function sseResponse(events: string[]): Response {
  return new Response(events.join("") + "data: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } })
}

/** A plain answer, split into a few deltas. */
export function textStream(text: string): Response {
  const parts = text.match(/.{1,12}/gs) ?? [""]
  return sseResponse([...parts.map((part, index) => chunk(index === 0 ? { content: part } : { content: part })), chunk({}, "stop", USAGE)])
}

/** One tool call with its JSON arguments. */
export function toolCallStream(name: string, input: unknown, id = "call_1"): Response {
  return sseResponse([
    chunk({ tool_calls: [{ index: 0, id, type: "function", function: { name, arguments: JSON.stringify(input) } }] }),
    chunk({}, "tool_calls", USAGE),
  ])
}

/** A fetch that answers each call with the next response and records the requests. */
export function scriptedFetch(responses: (() => Response)[]) {
  const calls: { url: string; init: RequestInit; body: Record<string, unknown> | null }[] = []
  const fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const body = typeof init.body === "string" ? (JSON.parse(init.body) as Record<string, unknown>) : null
    calls.push({ url: String(input), init, body })
    const next = responses[calls.length - 1]
    if (!next) throw new Error(`No scripted response for call ${calls.length}`)
    return next()
  }
  return { fetch: fetch as typeof globalThis.fetch, calls }
}
