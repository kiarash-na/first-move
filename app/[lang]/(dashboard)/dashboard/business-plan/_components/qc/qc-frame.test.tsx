import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { QcFrame } from "./qc-frame"

describe("QcFrame", () => {
  it("is a cyan-ruled, labelled region marked read-only", () => {
    render(
      <QcFrame id="x" title="From the Quick Check" lead="Shared numbers." readOnlyLabel="Read-only">
        <p>Inside</p>
      </QcFrame>,
    )
    const region = screen.getByRole("region", { name: "From the Quick Check" })
    expect(region.className).toContain("before:bg-primary")
    expect(screen.getByText("Read-only")).toBeInTheDocument()
    expect(screen.getByText("Shared numbers.")).toBeInTheDocument()
    expect(screen.getByText("Inside")).toBeInTheDocument()
  })

  it("titles the frame with an H2, as it sits directly under the page title", () => {
    render(
      <QcFrame id="x" title="From the Quick Check" lead="Shared numbers." readOnlyLabel="Read-only">
        <p>Inside</p>
      </QcFrame>,
    )
    expect(screen.getByRole("heading", { level: 2, name: "From the Quick Check" })).toBeInTheDocument()
  })
})
