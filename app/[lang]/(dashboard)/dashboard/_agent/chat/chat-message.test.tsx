import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { assistantCopy, renderAgent } from "../test-utils/render"
import { ChatMessage } from "./chat-message"
import type { ChatItem } from "./use-assistant-chat"

const copy = assistantCopy()

const item = (overrides: Partial<ChatItem>): ChatItem => ({ id: "m1", role: "assistant", text: "", tools: [], proposals: [], error: null, done: true, ...overrides })

function show(value: ChatItem, last = true) {
  const onRetry = vi.fn()
  renderAgent(
    <ul>
      <ChatMessage item={value} proposals={{}} project={null} last={last} onRetry={onRetry} onApply={vi.fn()} onDismiss={vi.fn()} />
    </ul>,
  )
  return { onRetry, li: document.querySelector<HTMLElement>("[data-slot='chat-message']")! }
}

describe("ChatMessage", () => {
  it("marks an answer as AI-generated, visibly and in the markup", () => {
    const { li } = show(item({ text: "The network is **2.4 km** long.", tools: ["explain"] }))
    expect(li).toHaveAttribute("data-ai-generated", "true")
    expect(li).toHaveTextContent(copy.chat.aiLabel)
    expect(li).toHaveTextContent(copy.chat.tools.explain)
    expect(screen.getByText("2.4 km").tagName).toBe("STRONG")
  })

  it("shows the user's words as plain text, without the AI mark", () => {
    const { li } = show(item({ role: "user", text: "<b>Hello</b>" }))
    expect(li).toHaveAttribute("data-role", "user")
    expect(li).not.toHaveAttribute("data-ai-generated")
    expect(li).toHaveTextContent("<b>Hello</b>")
    expect(li.querySelector("b")).toBeNull()
  })

  it("says it is working until the first words arrive", () => {
    show(item({ done: false }))
    expect(screen.getByText(copy.chat.working)).toBeInTheDocument()
  })

  it("explains a failure and offers to try again on the last message only", async () => {
    const { onRetry } = show(item({ error: "rate" }))
    expect(screen.getByRole("alert")).toHaveTextContent(copy.errors.rate)
    await userEvent.click(screen.getByRole("button", { name: copy.chat.retry }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it("offers no retry after the user stopped the answer, or on an older message", () => {
    show(item({ error: "aborted" }))
    expect(screen.queryByRole("button", { name: copy.chat.retry })).not.toBeInTheDocument()
  })
})
