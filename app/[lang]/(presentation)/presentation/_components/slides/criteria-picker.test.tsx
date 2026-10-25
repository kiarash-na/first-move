import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { DeckContext } from "../deck-context"
import { CriteriaPicker } from "./criteria-picker"

const criteria = [
  { label: "Correct methodology", answer: "Every equation, tested.", slide: 2 },
  { label: "Risks and validation", answer: "An AI panel scores it.", slide: 4 },
]
const labels = { criteria: "What the jury asks", answer: "Where we answer", goTo: "Go to slide {number}" }

function setup() {
  const goTo = vi.fn()
  render(
    <DeckContext.Provider value={{ index: 1, count: 10, goTo }}>
      <CriteriaPicker criteria={criteria} labels={labels} />
    </DeckContext.Provider>,
  )
  return goTo
}

describe("CriteriaPicker", () => {
  it("starts on the first criterion and shows its answer", () => {
    setup()
    expect(screen.getByRole("button", { name: /Correct methodology/ })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText("Every equation, tested.")).toBeInTheDocument()
  })

  it("picks another criterion and jumps, with focus, to the slide that answers it", async () => {
    const goTo = setup()
    await userEvent.click(screen.getByRole("button", { name: /Risks and validation/ }))
    expect(screen.getByRole("button", { name: /Risks and validation/ })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText("An AI panel scores it.")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Go to slide 5" }))
    expect(goTo).toHaveBeenCalledWith(4, { focus: true })
  })
})
