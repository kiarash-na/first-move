import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ResultsSection } from "./results-section"

describe("ResultsSection", () => {
  it("is a region named by its title, with lead, actions and body", () => {
    render(
      <ResultsSection id="dims" title="Seven dimensions" lead="What makes a plan solid" actions={<button type="button">Act</button>} data-slot="x">
        <p>body</p>
      </ResultsSection>,
    )
    const region = screen.getByRole("region", { name: "Seven dimensions" })
    expect(region).toHaveAttribute("id", "dims")
    expect(region).toHaveAttribute("data-slot", "x")
    expect(region).toHaveTextContent("What makes a plan solid")
    expect(screen.getByRole("button", { name: "Act" })).toBeInTheDocument()
    expect(screen.getByText("body")).toBeInTheDocument()
  })
})
