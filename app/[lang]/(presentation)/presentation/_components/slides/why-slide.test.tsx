import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import de from "@/dictionaries/de/presentation.json"
import { WhySlide } from "./why-slide"

describe("WhySlide", () => {
  it("explains the name with its number, title and the first move", () => {
    render(<WhySlide number={1} copy={de.slides.why} />)
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(`${de.slides.why.headline} ${de.slides.why.accent}`)
    expect(screen.getByText("01")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: de.slides.why.play })).toBeInTheDocument()
  })
})
