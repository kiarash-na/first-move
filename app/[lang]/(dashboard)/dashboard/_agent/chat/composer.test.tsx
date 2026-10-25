import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { assistantCopy, renderAgent } from "../test-utils/render"
import { Composer } from "./composer"

const copy = assistantCopy().chat

describe("Composer", () => {
  it("sends with Enter, adds a line with Shift+Enter, and empties the field", async () => {
    const onSend = vi.fn()
    renderAgent(<Composer busy={false} onSend={onSend} onStop={vi.fn()} />)
    const field = screen.getByLabelText(copy.label)
    expect(screen.getByRole("button", { name: copy.send })).toBeDisabled()
    await userEvent.type(field, "First line{Shift>}{Enter}{/Shift}second")
    expect(onSend).not.toHaveBeenCalled()
    await userEvent.type(field, "{Enter}")
    expect(onSend).toHaveBeenCalledWith("First line\nsecond")
    expect(field).toHaveValue("")
  })

  it("sends nothing blank, and offers Stop while an answer streams", async () => {
    const onSend = vi.fn()
    const onStop = vi.fn()
    const { rerender } = renderAgent(<Composer busy={false} onSend={onSend} onStop={onStop} />)
    await userEvent.type(screen.getByLabelText(copy.label), "   {Enter}")
    expect(onSend).not.toHaveBeenCalled()
    rerender(<Composer busy onSend={onSend} onStop={onStop} />)
    expect(screen.queryByRole("button", { name: copy.send })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: copy.stop }))
    expect(onStop).toHaveBeenCalledOnce()
  })
})
