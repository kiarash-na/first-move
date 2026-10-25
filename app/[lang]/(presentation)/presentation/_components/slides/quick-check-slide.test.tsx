import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import de from "@/dictionaries/de/presentation.json"
import { QuickCheckSlide } from "./quick-check-slide"

const levelNames = { promising: "Vielversprechend", further_analysis: "Weitere Analyse", not_promising: "Nicht vielversprechend" }

describe("QuickCheckSlide", () => {
  it("shows the example's result in German numbers with the Quick Check's own level names", () => {
    const { container } = render(<QuickCheckSlide number={3} lang="de" copy={de.slides.quickCheck} levelNames={levelNames} />)
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(de.slides.quickCheck.headline)
    expect(screen.getByRole("group", { name: de.slides.quickCheck.levelsLabel })).toHaveTextContent("Vielversprechend")
    expect(container.querySelector(".console__figures")).toHaveTextContent(/MWh\/a/)
    expect(container.querySelector(".console__figures")).toHaveTextContent(/\d,\d\d/)
  })
})
