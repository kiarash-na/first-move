import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import en from "@/dictionaries/en/presentation.json"
import { DeckContext } from "../deck-context"
import { StepsMeter } from "./steps-meter"

const copy = en.slides.businessPlan

function setup() {
  const goTo = vi.fn()
  const { container } = render(
    <DeckContext.Provider value={{ index: 3, count: 10, goTo }}>
      <StepsMeter lang="en" copy={copy} judgeSlide={4} />
    </DeckContext.Provider>,
  )
  return { goTo, container }
}

describe("StepsMeter", () => {
  it("lists the four steps, closed, and an empty illustrative meter", () => {
    setup()
    for (const step of copy.steps) expect(screen.getByRole("button", { name: new RegExp(step.label) })).toHaveAttribute("aria-expanded", "false")
    expect(screen.getByText(copy.illustrative)).toBeInTheDocument()
    expect(screen.getByText("0%")).toBeInTheDocument()
  })

  it("opens a step to show what it asks and fills the meter by the share covered", async () => {
    const { container } = setup()
    const first = screen.getByRole("button", { name: new RegExp(copy.steps[0].label) })
    await userEvent.click(first)
    await userEvent.click(screen.getByRole("button", { name: new RegExp(copy.steps[2].label) }))
    expect(first).toHaveAttribute("aria-expanded", "true")
    expect(document.getElementById(first.getAttribute("aria-controls") ?? "")).toHaveTextContent(copy.steps[0].text)
    expect(screen.getByText("50%")).toBeInTheDocument()
    expect(container.querySelector<HTMLElement>(".meter")?.style.getPropertyValue("--share")).toBe("0.5")
    await userEvent.click(first)
    expect(screen.getByText("25%")).toBeInTheDocument()
  })

  it("leads to the slide that judges", async () => {
    const { goTo } = setup()
    await userEvent.click(screen.getByRole("button", { name: copy.judge }))
    expect(goTo).toHaveBeenCalledWith(4, { focus: true })
  })
})
