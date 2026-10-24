import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ReportSection } from "./report-section"

describe("ReportSection", () => {
  it("is a section named by its title, with its lead and content", () => {
    render(
      <ReportSection title="Inputs" lead="As entered." tone="cool">
        <p>content</p>
      </ReportSection>,
    )
    const section = screen.getByRole("region", { name: "Inputs" })
    expect(section).toHaveTextContent("As entered.")
    expect(section).toHaveTextContent("content")
    expect(screen.getByRole("heading", { level: 2, name: "Inputs" }).parentElement).toHaveClass("border-primary")
  })

  it("starts a new printed page when asked, in the module colour", () => {
    render(
      <ReportSection title="Business Plan" tone="hot" pageBreak>
        <p>x</p>
      </ReportSection>,
    )
    const section = screen.getByRole("region", { name: "Business Plan" })
    expect(section).toHaveClass("print:break-before-page")
    expect(screen.getByRole("heading", { level: 2 }).parentElement).toHaveClass("border-hot")
  })
})
