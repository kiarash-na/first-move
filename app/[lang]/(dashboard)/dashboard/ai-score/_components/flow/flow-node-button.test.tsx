import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { FlowNodeButton } from "./flow-node-button"

describe("FlowNodeButton", () => {
  it("is a focusable node that opens its detail as a labelled dialog, and closes on Escape", async () => {
    render(
      <FlowNodeButton nodeKey="gate:anchor" kind="Check" title="Anchor customer" trigger={<span>Anchor customer · Pass</span>} data={{ outcome: "pass", cap: undefined }}>
        <p>Detail text</p>
      </FlowNodeButton>,
    )
    const node = screen.getByRole("button", { name: "Anchor customer · Pass" })
    expect(node).toHaveAttribute("data-flow-node", "gate:anchor")
    expect(node).toHaveAttribute("data-outcome", "pass")
    expect(node).not.toHaveAttribute("data-cap")
    node.focus()
    await userEvent.keyboard("{Enter}")
    const dialog = screen.getByRole("dialog", { name: "Anchor customer" })
    expect(dialog).toHaveTextContent("Check")
    expect(dialog).toHaveTextContent("Detail text")
    await userEvent.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(node).toHaveFocus()
  })
})
