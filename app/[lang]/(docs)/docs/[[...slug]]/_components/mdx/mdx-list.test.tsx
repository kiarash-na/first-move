import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MdxList } from "./mdx-list"

describe("MdxList", () => {
  it("renders a bullet list with its items", () => {
    render(
      <MdxList>
        <li>Quick Check</li>
        <li>Business Plan</li>
      </MdxList>,
    )
    const list = screen.getByRole("list")
    expect(list.tagName).toBe("UL")
    expect(list.className).toContain("list-disc")
    expect(screen.getAllByRole("listitem")).toHaveLength(2)
  })
})
