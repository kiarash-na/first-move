import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MdxOrderedList } from "./mdx-ordered-list"

describe("MdxOrderedList", () => {
  it("renders a numbered list with its items", () => {
    render(
      <MdxOrderedList>
        <li>Open the dashboard.</li>
        <li>Start a project.</li>
      </MdxOrderedList>,
    )
    const list = screen.getByRole("list")
    expect(list.tagName).toBe("OL")
    expect(list.className).toContain("list-decimal")
    expect(screen.getAllByRole("listitem")).toHaveLength(2)
  })
})
