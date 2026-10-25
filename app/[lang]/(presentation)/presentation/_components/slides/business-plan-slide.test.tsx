import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import en from "@/dictionaries/en/presentation.json"
import { SLIDE_IDS } from "@/lib/presentation/slides"
import { DeckContext } from "../deck-context"
import { BusinessPlanSlide } from "./business-plan-slide"

describe("BusinessPlanSlide", () => {
  it("shows the four steps and links Pitch completeness to the AI Plan Score slide", async () => {
    const goTo = vi.fn()
    render(
      <DeckContext.Provider value={{ index: 3, count: 10, goTo }}>
        <BusinessPlanSlide number={4} lang="en" copy={en.slides.businessPlan} />
      </DeckContext.Provider>,
    )
    expect(screen.getAllByRole("listitem")).toHaveLength(4)
    expect(screen.getByText(en.slides.businessPlan.meter)).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: en.slides.businessPlan.judge }))
    expect(goTo).toHaveBeenCalledWith(SLIDE_IDS.indexOf("aiEngine"), { focus: true })
  })
})
