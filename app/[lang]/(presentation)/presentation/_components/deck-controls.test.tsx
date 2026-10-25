import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { DeckContext } from "./deck-context"
import { DeckControls } from "./deck-controls"

const copy = { index: "All slides", goTo: "Slide {number}: {title}", previous: "Previous slide", next: "Next slide", hint: "Arrow keys" }
const titles = ["Why", "Challenge", "Quick Check"]

function setup(index: number) {
  const goTo = vi.fn()
  render(
    <DeckContext.Provider value={{ index, count: titles.length, goTo }}>
      <DeckControls copy={copy} titles={titles} />
    </DeckContext.Provider>,
  )
  return goTo
}

describe("DeckControls", () => {
  it("sits in a landmark of its own, with the hint", () => {
    setup(0)
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Arrow keys")
  })

  it("names every dot after its slide and marks the current one", () => {
    setup(1)
    expect(screen.getByRole("button", { name: "Slide 2: Challenge" })).toHaveAttribute("aria-current", "step")
    expect(screen.getByRole("button", { name: "Slide 1: Why" })).not.toHaveAttribute("aria-current")
  })

  it("goes to a slide from a dot or the select, with focus", async () => {
    const goTo = setup(0)
    await userEvent.click(screen.getByRole("button", { name: "Slide 3: Quick Check" }))
    expect(goTo).toHaveBeenLastCalledWith(2, { focus: true })
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "All slides" }), "1")
    expect(goTo).toHaveBeenLastCalledWith(1, { focus: true })
  })

  it("steps with the arrows and keeps them focusable at the ends", async () => {
    const goTo = setup(0)
    const previous = screen.getByRole("button", { name: "Previous slide" })
    expect(previous).toHaveAttribute("aria-disabled", "true")
    await userEvent.click(previous)
    expect(goTo).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole("button", { name: "Next slide" }))
    expect(goTo).toHaveBeenCalledWith(1)
  })
})
