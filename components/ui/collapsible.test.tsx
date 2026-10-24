import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible"

describe("Collapsible", () => {
  it("is closed by default and toggles from its trigger", async () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>More</CollapsibleTrigger>
        <CollapsibleContent>Hidden text</CollapsibleContent>
      </Collapsible>,
    )
    const trigger = screen.getByRole("button", { name: "More" })
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByText("Hidden text")).not.toBeInTheDocument()
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText("Hidden text")).toBeVisible()
  })
})
