import type { ModelMessage } from "ai"
import { describe, expect, it } from "vitest"
import { openRouterClient } from "../openrouter/client"
import { scriptedFetch, textStream, toolCallStream } from "../openrouter/test-utils/sse"
import { assistantErrorCode } from "../providers/errors"
import { assistantInstructions } from "./instructions"
import { runTurn, type TurnEvent } from "./run-turn"
import { exampleProject, testContext } from "./test-utils/context"
import { assistantTools } from "./tools"

const KEY = `sk-or-v1-${"9a".repeat(32)}`
const user = (text: string): ModelMessage[] => [{ role: "user", content: text }]

async function turn(responses: (() => Response)[], text = "How does my project look?", signal?: AbortSignal) {
  const { fetch, calls } = scriptedFetch(responses)
  const { context, proposals } = await testContext(exampleProject())
  const events: TurnEvent[] = []
  const promise = runTurn({
    model: openRouterClient(KEY, fetch).chatModel("openrouter/auto"),
    instructions: assistantInstructions("en"),
    messages: user(text),
    tools: assistantTools(context),
    abortSignal: signal,
    onEvent: (event) => events.push(event),
  })
  return { promise, calls, events, proposals }
}

describe("runTurn", () => {
  it("runs a tool, streams the answer and returns the messages to keep", async () => {
    const { promise, calls, events } = await turn([() => toolCallStream("get_project", {}), () => textStream("Your project looks promising.")])
    const messages = await promise
    expect(events.filter((event) => event.type === "tool")).toEqual([{ type: "tool", name: "get_project", toolCallId: "call_1" }])
    expect(events.filter((event) => event.type === "text").map((event) => (event as { delta: string }).delta).join("")).toBe("Your project looks promising.")
    expect(messages.map((message) => message.role)).toEqual(["assistant", "tool", "assistant"])
    // The second request carries the tool result back to the model.
    expect(JSON.stringify(calls[1].body)).toContain("untrusted_document")
    const tools = (calls[0].body?.tools as { function: { name: string } }[]).map((entry) => entry.function.name).sort()
    expect(tools).toEqual(["explain", "get_project", "propose_values", "search_docs"])
    expect(JSON.stringify(calls[0].body)).toContain("You are the AI assistant inside First Move")
  })

  it("shows a proposal for review without applying it", async () => {
    const { promise, proposals } = await turn([
      () => toolCallStream("propose_values", { values: [{ field: "buildings.total", value: 72, quote: "72 buildings" }] }, "call_p"),
      () => textStream("I proposed 72 buildings; apply it in the card if it is right."),
    ])
    await promise
    expect(proposals.get("call_p")?.patch).toEqual({ "buildings.total": 72 })
  })

  it("throws provider errors for the copy mapping", async () => {
    const { promise } = await turn([() => Response.json({ error: { message: "Insufficient credits", code: 402 } }, { status: 402 })])
    const error = await promise.catch((caught: unknown) => caught)
    expect(assistantErrorCode(error)).toBe("credits")
  })

  it("stops when the user stops it", async () => {
    const controller = new AbortController()
    controller.abort()
    const { promise } = await turn([() => textStream("never")], "Hi", controller.signal)
    expect(assistantErrorCode(await promise.catch((caught: unknown) => caught))).toBe("aborted")
  })
})
