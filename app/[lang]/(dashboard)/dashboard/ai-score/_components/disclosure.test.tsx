import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { InfoIcon } from "lucide-react"
import { describe, expect, it } from "vitest"

import { Disclosure } from "./disclosure"

describe("Disclosure", () => {
  it("starts collapsed and opens on click", async () => {
    render(
      <Disclosure icon={InfoIcon} title="How we estimate">
        <p>Four turns.</p>
      </Disclosure>,
    )
    const trigger = screen.getByRole("button", { name: "How we estimate" })
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByText("Four turns.")).not.toBeInTheDocument()
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText("Four turns.")).toBeVisible()
  })
})
