import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MdxStrong } from "./mdx-strong"

describe("MdxStrong", () => {
  it("renders bold text in the foreground colour", () => {
    render(<MdxStrong>Promising</MdxStrong>)
    const strong = screen.getByText("Promising")
    expect(strong.tagName).toBe("STRONG")
    expect(strong.className).toContain("text-foreground")
  })
})
