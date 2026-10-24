import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MdxParagraph } from "./mdx-paragraph"

describe("MdxParagraph", () => {
  it("renders body text at the preferred measure", () => {
    render(<MdxParagraph>Your data stays in your browser.</MdxParagraph>)
    const paragraph = screen.getByText("Your data stays in your browser.")
    expect(paragraph.tagName).toBe("P")
    expect(paragraph.className).toContain("max-w-[68ch]")
  })
})
