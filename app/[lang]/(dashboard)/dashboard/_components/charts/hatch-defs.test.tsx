import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { HATCH_BACKGROUND, HatchDefs } from "./hatch-defs"

describe("HatchDefs", () => {
  it("defines a 45 degree pattern with the given id", () => {
    const { container } = render(
      <svg>
        <HatchDefs id="hatch-a" />
      </svg>,
    )
    const pattern = container.querySelector("pattern")
    expect(pattern).toHaveAttribute("id", "hatch-a")
    expect(pattern).toHaveAttribute("patternTransform", "rotate(45)")
    expect(HATCH_BACKGROUND).toContain("--chart-5")
  })
})
