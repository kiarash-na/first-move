import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DeckContext, SlideIndexContext, useDeck, useSlideActive } from "./deck-context"

function Probe() {
  const active = useSlideActive()
  const { count } = useDeck()
  return <p>{`${active ? "active" : "idle"} of ${count}`}</p>
}

describe("deck context", () => {
  it("tells a component whether its slide is on screen", () => {
    render(
      <DeckContext.Provider value={{ index: 2, count: 10, goTo: () => {} }}>
        <SlideIndexContext.Provider value={2}>
          <Probe />
        </SlideIndexContext.Provider>
        <SlideIndexContext.Provider value={3}>
          <Probe />
        </SlideIndexContext.Provider>
      </DeckContext.Provider>,
    )
    expect(screen.getByText("active of 10")).toBeInTheDocument()
    expect(screen.getByText("idle of 10")).toBeInTheDocument()
  })

  it("works without a deck (first slide)", () => {
    render(<Probe />)
    expect(screen.getByText("active of 1")).toBeInTheDocument()
  })
})
