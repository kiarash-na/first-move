import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SectionPanel } from "./section-panel"

describe("SectionPanel", () => {
  it("is a labelled region with an orange rule, index, help and content", () => {
    render(
      <SectionPanel id="canvas" index={2} title="Business Model Canvas" help="Pay attention to the value proposition." actions={<button>Act</button>}>
        <p>Body</p>
      </SectionPanel>,
    )
    const region = screen.getByRole("region", { name: "Business Model Canvas" })
    expect(region.className).toContain("before:bg-hot")
    expect(screen.getByText("02")).toBeInTheDocument()
    expect(screen.getByText("Pay attention to the value proposition.")).toBeInTheDocument()
    expect(screen.getByText("Body")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Act" })).toBeInTheDocument()
  })

  it("works without index, help and id", () => {
    render(<SectionPanel title="Plain">x</SectionPanel>)
    expect(screen.getByRole("heading", { name: "Plain" })).toBeInTheDocument()
  })
})
