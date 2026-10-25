import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import de from "@/dictionaries/de/presentation.json"
import { NextMovesSlide } from "./next-moves-slide"

describe("NextMovesSlide", () => {
  it("shows the five next moves: the 3D scan first, then four more", () => {
    render(<NextMovesSlide number={9} copy={de.slides.nextMoves} />)
    const titles = screen.getAllByRole("listitem").map((item) => item.querySelector(".feature__title")?.textContent)
    expect(titles).toEqual(de.slides.nextMoves.features.map((feature) => feature.title))
    expect(titles).toHaveLength(5)
  })
})
