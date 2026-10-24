import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { LegalBlocks } from "./legal-blocks"

describe("LegalBlocks", () => {
  it("draws paragraphs, lists and notes", () => {
    render(<LegalBlocks lang="en" label="Section" body={["Intro text.", "- one", "- two", "1. first", "2. second", "> Important"]} />)
    expect(screen.getByText("Intro text.").tagName).toBe("P")
    expect(within(screen.getAllByRole("list")[0]).getAllByRole("listitem")).toHaveLength(2)
    expect(screen.getAllByRole("list")[1].tagName).toBe("OL")
    expect(screen.getByRole("note")).toHaveTextContent("Important")
  })

  it("draws a table with header cells, in a named scrollable region", () => {
    render(<LegalBlocks lang="en" label="Storage" body={["| Name | Purpose |", "|---|---|", "| `a` | b |", "| c | d |"]} />)
    const region = screen.getByRole("region", { name: "Storage" })
    expect(region).toHaveAttribute("tabindex", "0")
    expect(within(region).getAllByRole("columnheader")).toHaveLength(2)
    expect(within(region).getAllByRole("row")).toHaveLength(3)
    expect(within(region).getByText("a").tagName).toBe("CODE")
  })

  it("renders nothing for an empty body", () => {
    const { container } = render(<LegalBlocks lang="en" label="x" body={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
