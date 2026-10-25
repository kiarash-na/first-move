import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { OWNER_LINK, qrMatrix, QUIET_ZONE } from "@/lib/presentation/qr"
import { QrCode } from "./qr-code"

describe("QrCode", () => {
  it("draws the owner's link as a labelled image on a light panel with its quiet zone", () => {
    render(<QrCode value={OWNER_LINK} label="QR code for kiarash.online/link" />)
    const svg = screen.getByRole("img", { name: "QR code for kiarash.online/link" })
    const side = qrMatrix(OWNER_LINK).size + 2 * QUIET_ZONE
    expect(svg).toHaveAttribute("data-theme", "light")
    expect(svg).toHaveAttribute("viewBox", `${-QUIET_ZONE} ${-QUIET_ZONE} ${side} ${side}`)
  })

  it("colours the three finder patterns like the mark: ink, orange, cyan", () => {
    const { container } = render(<QrCode value={OWNER_LINK} label="QR" />)
    expect([...container.querySelectorAll(".qr__finder")].map((path) => path.getAttribute("class"))).toEqual([
      "qr__finder qr__finder--ink",
      "qr__finder qr__finder--hot",
      "qr__finder qr__finder--cool",
    ])
    expect(container.querySelector(".qr__modules")?.getAttribute("d")).toMatch(/^M/)
  })
})
