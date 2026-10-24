import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MdxNote } from "./mdx-note"

describe("MdxNote", () => {
  it("renders a quoted block as a note, not as a quotation", () => {
    render(
      <MdxNote>
        <p>Screening, not engineering advice.</p>
      </MdxNote>,
    )
    const note = screen.getByRole("note")
    expect(note.tagName).toBe("DIV")
    expect(note).toHaveTextContent("Screening, not engineering advice.")
  })
})
