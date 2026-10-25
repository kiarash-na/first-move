import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ExpertTable } from "./expert-table"

const seats = [
  { id: "value", name: "Value", score: 0.7, capped: false },
  { id: "economics", name: "Economics", score: 0.5, capped: true },
  { id: "path", name: "Path", score: 0.4, capped: false },
]

describe("ExpertTable", () => {
  it("seats one expert per dimension and lights the first `lit` seats", () => {
    const { container } = render(<ExpertTable seats={seats} lit={2} centre={<span>55</span>} label="Seven dimensions" />)
    const seatGroups = container.querySelectorAll(".expert-table__seat")
    expect(seatGroups).toHaveLength(3)
    expect([...seatGroups].map((seat) => seat.hasAttribute("data-lit"))).toEqual([true, true, false])
    expect(seatGroups[1]).toHaveAttribute("data-capped", "true")
    expect(screen.getByRole("figure", { name: "Seven dimensions" })).toHaveTextContent("55")
  })

  it("places the first seat at the top of the table", () => {
    const { container } = render(<ExpertTable seats={seats} lit={0} centre={null} label="Table" />)
    const first = container.querySelector(".expert-table__seat rect")
    expect(Number(first?.getAttribute("x")) + 8).toBeCloseTo(120)
    expect(Number(first?.getAttribute("y")) + 8).toBeCloseTo(24)
  })
})
