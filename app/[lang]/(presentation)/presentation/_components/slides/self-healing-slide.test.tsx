import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import en from "@/dictionaries/en/presentation.json"
import { SelfHealingSlide } from "./self-healing-slide"

describe("SelfHealingSlide", () => {
  it("labels self-healing a concept that is not built", () => {
    render(<SelfHealingSlide number={8} copy={en.slides.selfHealing} />)
    expect(screen.getByText(en.slides.selfHealing.concept)).toBeInTheDocument()
    expect(screen.getByRole("group", { name: en.slides.selfHealing.loopLabel })).toBeInTheDocument()
  })
})
