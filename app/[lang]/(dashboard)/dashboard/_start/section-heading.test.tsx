import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SectionHeading } from "./section-heading"

describe("SectionHeading", () => {
  it("renders an h2 with its lead and aside", () => {
    render(<SectionHeading id="x" title="Examples" body="Six projects" aside={<span>6</span>} />)
    expect(screen.getByRole("heading", { level: 2, name: "Examples" })).toHaveAttribute("id", "x")
    expect(screen.getByText("Six projects")).toBeInTheDocument()
    expect(screen.getByText("6")).toBeInTheDocument()
  })
})
