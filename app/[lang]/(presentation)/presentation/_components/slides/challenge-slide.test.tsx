import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import en from "@/dictionaries/en/presentation.json"
import { DeckContext } from "../deck-context"
import { ChallengeSlide } from "./challenge-slide"

const copy = en.slides.challenge

describe("ChallengeSlide", () => {
  it("names who it is for", () => {
    render(<ChallengeSlide number={2} copy={copy} />)
    for (const audience of copy.audiences) expect(screen.getByText(audience).tagName).toBe("LI")
  })

  it("maps every jury criterion to the slide that answers it", async () => {
    const goTo = vi.fn()
    render(
      <DeckContext.Provider value={{ index: 1, count: 10, goTo }}>
        <ChallengeSlide number={2} copy={copy} />
      </DeckContext.Provider>,
    )
    const expected = [2, 2, 3, 3, 4, 5]
    for (const [index, criterion] of copy.criteria.entries()) {
      await userEvent.click(screen.getByRole("button", { name: new RegExp(criterion.label) }))
      await userEvent.click(screen.getByRole("button", { name: `Go to slide ${expected[index] + 1}` }))
      expect(goTo).toHaveBeenLastCalledWith(expected[index], { focus: true })
    }
  })
})
