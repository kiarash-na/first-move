import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { FieldLabel } from "./field-label"

describe("FieldLabel", () => {
  it("labels an input and shows the help line and extra content", () => {
    render(
      <>
        <FieldLabel htmlFor="x" helpId="x-help" label="Value proposition" help="What you offer">
          <span>Focus</span>
        </FieldLabel>
        <input id="x" aria-describedby="x-help" />
      </>,
    )
    expect(screen.getByLabelText("Value proposition")).toHaveAccessibleDescription("What you offer")
    expect(screen.getByText("Focus")).toBeInTheDocument()
  })

  it("omits the help line when there is none", () => {
    const { container } = render(<FieldLabel label="Only a label" help={null} />)
    expect(container.querySelector("p")).toBeNull()
  })
})
