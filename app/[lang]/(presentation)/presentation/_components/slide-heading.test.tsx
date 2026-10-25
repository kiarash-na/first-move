import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SlideHeading } from "./slide-heading"

describe("SlideHeading", () => {
  it("numbers the kicker and reads the two title lines as one heading", () => {
    render(<SlideHeading number={3} kicker="Quick Check" headline="Same inputs." accent="Same result." />)
    expect(screen.getByRole("heading", { level: 2, name: "Same inputs. Same result." })).toBeInTheDocument()
    expect(screen.getByText("03")).toBeInTheDocument()
  })
})
