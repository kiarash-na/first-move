import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PageHeader } from "./page-header"

describe("PageHeader", () => {
  it("renders the eyebrow in the module colour, the title as h1, the lead and actions", () => {
    render(<PageHeader eyebrow="Quick Check" title="Project area" description="Lead" tone="cool" actions={<button>Go</button>} />)
    expect(screen.getByRole("heading", { level: 1, name: "Project area" })).toBeInTheDocument()
    expect(screen.getByText("Quick Check").className).toContain("text-primary")
    expect(screen.getByText("Lead")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument()
  })
})
