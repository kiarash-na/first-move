import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MdxH1 } from "./mdx-h1"

describe("MdxH1", () => {
  it("renders the page title as the one level-1 heading", () => {
    render(<MdxH1>Quick Check</MdxH1>)
    expect(screen.getByRole("heading", { level: 1, name: "Quick Check" })).toBeInTheDocument()
  })
})
