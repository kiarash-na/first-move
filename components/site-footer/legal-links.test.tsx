import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import en from "@/dictionaries/en/legal.json"
import { LegalLinks } from "./legal-links"

describe("LegalLinks", () => {
  it("links all six documents, localized, in footer order", () => {
    render(<LegalLinks lang="de" labels={en.docs} navLabel={en.footer.nav} />)
    const nav = screen.getByRole("navigation", { name: en.footer.nav })
    expect(within(nav).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      "/de/terms",
      "/de/privacy",
      "/de/cookies",
      "/de/imprint",
      "/de/ai",
      "/de/license",
    ])
    expect(within(nav).getByRole("link", { name: en.docs.imprint })).toBeInTheDocument()
  })

  it("adds an extra external link after the six", () => {
    render(<LegalLinks lang="en" labels={en.docs} navLabel={en.footer.nav} extra={{ label: "Source", href: "https://github.com/x/y" }} />)
    const last = screen.getAllByRole("link").at(-1)
    expect(last).toHaveTextContent("Source")
    expect(last).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("adds several extra links in order; a path inside the app stays an internal link", () => {
    render(
      <LegalLinks
        lang="en"
        labels={en.docs}
        navLabel={en.footer.nav}
        extra={[
          { label: "Presentation", href: "/en/presentation" },
          { label: "Source", href: "https://github.com/x/y" },
        ]}
      />,
    )
    const [presentation, source] = screen.getAllByRole("link").slice(-2)
    expect(presentation).toHaveTextContent("Presentation")
    expect(presentation).toHaveAttribute("href", "/en/presentation")
    expect(presentation).not.toHaveAttribute("rel")
    expect(source).toHaveAttribute("rel", "noopener noreferrer")
  })
})
