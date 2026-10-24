import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { NetworkMark } from "./network-mark"

describe("NetworkMark", () => {
  it("is decorative and drawn in the brand roles only", () => {
    const { container } = render(<NetworkMark className="size-40" />)
    const svg = container.querySelector("svg")!
    expect(svg).toHaveAttribute("aria-hidden", "true")
    expect(svg.querySelector(".stroke-primary")).not.toBeNull()
    expect(svg.querySelector(".stroke-hot")).not.toBeNull()
  })
})
