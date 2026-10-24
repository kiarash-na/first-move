import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MdxCode } from "./mdx-code"

describe("MdxCode", () => {
  it("renders inline code in the mono font", () => {
    render(<MdxCode>.firstmove.json</MdxCode>)
    const code = screen.getByText(".firstmove.json")
    expect(code.tagName).toBe("CODE")
    expect(code.className).toContain("font-mono")
  })
})
