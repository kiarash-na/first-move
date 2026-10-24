import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MdxH2 } from "./mdx-h2"

describe("MdxH2", () => {
  it("gets the anchor id the knowledge index links to", () => {
    render(<MdxH2>The first email: confirm once</MdxH2>)
    expect(screen.getByRole("heading", { level: 2, name: "The first email: confirm once" })).toHaveAttribute("id", "the-first-email-confirm-once")
  })

  it("builds the id from the text of nested children", () => {
    render(
      <MdxH2>
        Step 1: <em>Opportunität</em>
      </MdxH2>,
    )
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute("id", "step-1-opportunitat")
  })
})
