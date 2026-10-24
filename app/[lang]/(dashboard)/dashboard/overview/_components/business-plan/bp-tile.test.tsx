import { render, screen } from "@testing-library/react"
import { ShieldAlertIcon } from "lucide-react"
import { describe, expect, it } from "vitest"
import { BpTile } from "./bp-tile"

describe("BpTile", () => {
  it("is a titled article with an orange rule", () => {
    render(
      <BpTile id="x" icon={ShieldAlertIcon} title="Top risks">
        <p>content</p>
      </BpTile>,
    )
    const tile = screen.getByRole("article", { name: "Top risks" })
    expect(tile).toHaveClass("before:bg-hot")
    expect(screen.getByText("content")).toBeInTheDocument()
  })
})
