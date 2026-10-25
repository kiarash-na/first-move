import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ToolExecutionOptions } from "ai"
import { describe, expect, it, vi } from "vitest"

import type { Proposal } from "@/lib/ai/extract/propose"
import { exampleProject, testContext } from "@/lib/assistant/agent/test-utils/context"
import { assistantTools } from "@/lib/assistant/agent/tools"
import { assistantCopy, renderAgent } from "../test-utils/render"
import { ReviewCard } from "./review-card"
import type { ProposalItem } from "./use-assistant-chat"

const copy = assistantCopy().review

/** A proposal as the `propose_values` tool builds it for the example project. */
async function proposal(values: unknown[]): Promise<Proposal> {
  const { context, proposals } = await testContext(exampleProject())
  const propose = assistantTools(context).propose_values as unknown as { execute: (input: unknown, options: ToolExecutionOptions<never>) => Promise<unknown> }
  await propose.execute({ values }, { toolCallId: "call_1", messages: [] } as unknown as ToolExecutionOptions<never>)
  return proposals.get("call_1")!
}

const item = (value: Proposal, state: ProposalItem["state"] = "open", applied = 0): ProposalItem => ({ proposal: value, state, applied })

describe("ReviewCard", () => {
  it("shows each value now and proposed, lists what cannot apply, and applies only the checked entries", async () => {
    const value = await proposal([
      { field: "buildings.total", value: 81, quote: "81 buildings" },
      { field: "site.name", value: "North Quarter", quote: "North Quarter" },
      { field: "buildings.areaM2", value: -5, unit: "m²", quote: "minus five" },
    ])
    const onApply = vi.fn()
    renderAgent(<ReviewCard item={item(value)} project={exampleProject()} onApply={onApply} onDismiss={vi.fn()} />)
    const boxes = screen.getAllByRole("checkbox")
    expect(boxes).toHaveLength(2)
    boxes.forEach((box) => expect(box).toBeChecked())
    expect(screen.getByText("81")).toBeInTheDocument()
    expect(screen.getByText("North Quarter")).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`^${copy.invalid}:`))).toBeInTheDocument()

    await userEvent.click(boxes[1])
    await userEvent.click(screen.getByRole("button", { name: copy.apply }))
    expect(onApply).toHaveBeenCalledWith([value.valid[0].key])
    await userEvent.click(boxes[0])
    expect(screen.getByRole("button", { name: copy.apply })).toBeDisabled()
  })

  it("says what happened once applied, dismissed or when the project is gone", async () => {
    const value = await proposal([{ field: "buildings.total", value: 81, quote: "81" }])
    const { rerender } = renderAgent(<ReviewCard item={item(value, "applied", 1)} project={exampleProject()} onApply={vi.fn()} onDismiss={vi.fn()} />)
    expect(screen.getByRole("status")).toHaveTextContent("Applied: 1.")
    expect(screen.getByRole("checkbox")).toBeDisabled()
    rerender(<ReviewCard item={item(value, "dismissed")} project={exampleProject()} onApply={vi.fn()} onDismiss={vi.fn()} />)
    expect(screen.getByRole("status")).toHaveTextContent(copy.dismissed)
    rerender(<ReviewCard item={item(value, "no-project")} project={null} onApply={vi.fn()} onDismiss={vi.fn()} />)
    expect(screen.getByRole("status")).toHaveTextContent(copy.noProject)
  })
})
