import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import de from "@/dictionaries/de/presentation.json"
import en from "@/dictionaries/en/presentation.json"
import { COST } from "@/lib/presentation/facts"
import { CostFigures } from "./cost-figures"

// Reduced motion: the figures rest on their final value at once.
beforeEach(() => vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} })))
afterEach(() => vi.unstubAllGlobals())

describe("CostFigures", () => {
  it("states the owner's figures: about €180 to build, about €5 a month for up to 1,000 users, maintenance extra", () => {
    const { container } = render(<CostFigures lang="en" copy={en.slides.contact} cost={COST} />)
    const [build, run] = container.querySelectorAll(".cost__figure")
    expect(build).toHaveTextContent(/about.*€180.*to build/)
    expect(run).toHaveTextContent(/about.*€5.*a month to run, up to 1,000 active users/)
    expect(container).toHaveTextContent(en.slides.contact.maintenance)
    expect(container.querySelector(".cost__note--small")).toHaveTextContent(/17 hours of work and about 38 hours of AI work/)
  })

  it("formats them the German way", () => {
    const { container } = render(<CostFigures lang="de" copy={de.slides.contact} cost={COST} />)
    expect(container).toHaveTextContent(/180\s€/)
    expect(container).toHaveTextContent("1.000")
  })
})
