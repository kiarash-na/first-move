import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { FieldError } from "./field-error"

describe("FieldError", () => {
  it("announces the message with an icon, not colour alone", () => {
    const { container } = render(<FieldError id="e">Too long</FieldError>)
    expect(screen.getByRole("alert")).toHaveTextContent("Too long")
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  })

  it("renders nothing without a message", () => {
    const { container } = render(<FieldError>{null}</FieldError>)
    expect(container).toBeEmptyDOMElement()
  })
})
