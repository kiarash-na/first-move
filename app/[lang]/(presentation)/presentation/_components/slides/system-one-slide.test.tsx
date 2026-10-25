import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import de from "@/dictionaries/de/presentation.json"
import en from "@/dictionaries/en/presentation.json"
import { SystemOneSlide } from "./system-one-slide"

describe("SystemOneSlide", () => {
  it("states the guard's real thresholds, formatted per language", () => {
    const { unmount } = render(<SystemOneSlide number={7} lang="en" copy={en.slides.systemOne} />)
    expect(screen.getByText("Thresholds in code: block 0.9 · strike 0.6 · off topic 0.7")).toBeInTheDocument()
    unmount()
    render(<SystemOneSlide number={7} lang="de" copy={de.slides.systemOne} />)
    expect(screen.getByText(/0,9/)).toBeInTheDocument()
  })

  it("shows both systems", () => {
    render(<SystemOneSlide number={7} lang="en" copy={en.slides.systemOne} />)
    expect(screen.getByText(en.slides.systemOne.fast.name)).toBeInTheDocument()
    expect(screen.getByText(en.slides.systemOne.slow.name)).toBeInTheDocument()
  })
})
