import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import de from "@/dictionaries/de/legal.json"
import en from "@/dictionaries/en/legal.json"
import { SiteFooter } from "./site-footer"

describe("SiteFooter", () => {
  it("names the operator, the year and the licence", () => {
    render(<SiteFooter lang="en" copy={en} />)
    expect(screen.getByRole("contentinfo")).toHaveTextContent("© 2026 Kiarash N.A. · Open source under Apache-2.0")
  })

  it("links the six legal pages and the source code", () => {
    render(<SiteFooter lang="en" copy={en} />)
    for (const label of Object.values(en.docs)) expect(screen.getByRole("link", { name: label })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: en.footer.source })).toHaveAttribute(
      "href",
      "https://github.com/kiarash-na/first-move",
    )
  })

  it("localizes the links", () => {
    render(<SiteFooter lang="de" copy={en} />)
    expect(screen.getByRole("link", { name: en.docs.imprint })).toHaveAttribute("href", "/de/imprint")
  })

  it("links the presentation in the page's language, before the source code (PLAN-PRESENTATION-00)", () => {
    render(<SiteFooter lang="de" copy={de} />)
    const links = screen.getAllByRole("link")
    const presentation = screen.getByRole("link", { name: "Präsentation" })
    expect(presentation).toHaveAttribute("href", "/de/presentation")
    expect(links.indexOf(presentation)).toBe(links.length - 2)
  })
})
