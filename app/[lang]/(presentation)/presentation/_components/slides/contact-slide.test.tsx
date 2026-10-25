import { render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import en from "@/dictionaries/en/presentation.json"
import { ContactSlide } from "./contact-slide"

beforeEach(() => vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} })))
afterEach(() => vi.unstubAllGlobals())

const copy = en.slides.contact

describe("ContactSlide", () => {
  it("offers collaboration and links the owner's page, also as a QR code", () => {
    render(<ContactSlide number={10} lang="en" copy={copy} />)
    expect(screen.getByText(copy.open)).toBeInTheDocument()
    expect(screen.getByRole("img", { name: copy.qrLabel })).toBeInTheDocument()
    const owner = screen.getByRole("link", { name: /kiarash\.online\/link/ })
    expect(owner).toHaveAttribute("href", "https://kiarash.online/link")
    expect(owner).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("says it is powered by /1Slash, a human and AI service, with its link", () => {
    render(<ContactSlide number={10} lang="en" copy={copy} />)
    const slash = screen.getByRole("link", { name: "/1Slash" })
    expect(slash).toHaveAttribute("href", "https://1sla.sh/")
    expect(slash).toHaveAttribute("target", "_blank")
    expect(slash).toHaveAttribute("rel", "noopener noreferrer")
    expect(screen.getByText(copy.slash)).toBeInTheDocument()
    expect(screen.getByText(copy.poweredBy)).toBeInTheDocument()
  })
})
