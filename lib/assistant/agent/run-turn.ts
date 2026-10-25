import { isStepCount, streamText, type LanguageModel, type ModelMessage, type ToolSet } from "ai"
import type { ProviderOptions } from "@/lib/ai/plan-score/report"

/** Tool steps per user message before the assistant must answer (PLAN-AGENT-05: 8). */
export const MAX_STEPS = 8

export type TurnEvent = { type: "text"; delta: string } | { type: "tool"; name: string; toolCallId: string }

export interface TurnOptions {
  model: LanguageModel
  instructions: string
  /** The conversation so far, ending with the user's message. */
  messages: ModelMessage[]
  tools: ToolSet
  providerOptions?: ProviderOptions
  abortSignal?: AbortSignal
  onEvent: (event: TurnEvent) => void
}

/**
 * One assistant turn in the browser: streams the answer and runs the tools (at most `MAX_STEPS`
 * steps), then returns the messages to append to the conversation. No sampling parameters. A
 * provider error that ends the stream is thrown, for the caller to map to copy.
 */
export async function runTurn({ model, instructions, messages, tools, providerOptions, abortSignal, onEvent }: TurnOptions): Promise<ModelMessage[]> {
  let failure: unknown = null
  const result = streamText({
    model,
    instructions,
    messages,
    tools,
    providerOptions,
    abortSignal,
    stopWhen: isStepCount(MAX_STEPS),
    maxRetries: 1,
    onError: ({ error }) => {
      failure ??= error
    },
  })
  for await (const part of result.stream) {
    if (part.type === "text-delta") onEvent({ type: "text", delta: part.text })
    else if (part.type === "tool-call") onEvent({ type: "tool", name: part.toolName, toolCallId: part.toolCallId })
    else if (part.type === "error") failure ??= part.error
    else if (part.type === "abort") throw new DOMException("Aborted", "AbortError")
  }
  if (failure) throw failure
  return await result.responseMessages
}
