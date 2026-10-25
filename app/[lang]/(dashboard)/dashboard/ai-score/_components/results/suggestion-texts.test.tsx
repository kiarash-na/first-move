import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SuggestionTexts } from "./suggestion-texts"

describe("SuggestionTexts", () => {
  it("lists the texts as AI output", () => {
    const { container } = render(<SuggestionTexts texts={["Name the operator.", "Quote one bill."]} />)
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Name the operator.", "Quote one bill."])
    expect(container.firstElementChild).toHaveAttribute("data-ai-generated", "true")
  })

  it("renders nothing without texts", () => {
    const { container } = render(<SuggestionTexts texts={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
