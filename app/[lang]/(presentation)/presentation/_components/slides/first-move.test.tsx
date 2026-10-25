import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import en from "@/dictionaries/en/presentation.json"
import { FirstMove } from "./first-move"

const copy = en.slides.why

describe("FirstMove", () => {
  it("shows the board, labelled, waiting for the first move", () => {
    render(<FirstMove copy={copy} />)
    expect(screen.getByRole("img", { name: copy.boardLabel })).toHaveAttribute("data-phase", "idle")
    expect(screen.getByText(copy.after)).toHaveAttribute("aria-hidden", "true")
  })

  it("plays the move and the network it opens, then offers to play again", async () => {
    render(<FirstMove copy={copy} />)
    await userEvent.click(screen.getByRole("button", { name: copy.play }))
    expect(screen.getByRole("img", { name: copy.boardLabel })).toHaveAttribute("data-phase", "played")
    expect(screen.getByText(copy.after)).toHaveAttribute("aria-hidden", "false")
    await userEvent.click(screen.getByRole("button", { name: copy.replay }))
    await waitFor(() => expect(screen.getByRole("img", { name: copy.boardLabel })).toHaveAttribute("data-phase", "played"))
  })

  it("draws five buildings, the start node and the end node of the mark", () => {
    const { container } = render(<FirstMove copy={copy} />)
    expect(container.querySelectorAll(".first-move__plot")).toHaveLength(5)
    expect(container.querySelector(".first-move__start")).not.toBeNull()
    expect(container.querySelector(".first-move__end")).not.toBeNull()
  })
})
