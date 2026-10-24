import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { InlineText } from "./inline-text"

describe("InlineText", () => {
  it("draws bold, code and links as elements", () => {
    render(<InlineText lang="de" text="See **bold**, `NEXT_LOCALE` and [privacy](/privacy#rights)." />)
    expect(screen.getByText("bold").tagName).toBe("STRONG")
    expect(screen.getByText("NEXT_LOCALE").tagName).toBe("CODE")
    expect(screen.getByRole("link", { name: "privacy" })).toHaveAttribute("href", "/de/privacy#rights")
  })

  it("resolves tokens before drawing", () => {
    render(<InlineText lang="en" text="Write to [{{operator.emailHuman}}](mailto:{{operator.emailHuman}})" />)
    expect(screen.getByRole("link", { name: "human@mail.firstmove.energy" })).toHaveAttribute(
      "href",
      "mailto:human@mail.firstmove.energy",
    )
  })

  it("names the country in German on a German page", () => {
    render(<InlineText lang="de" text="{{operator.address}}" />)
    expect(screen.getByText("Postfach 13 02 66, 20102 Hamburg, Deutschland")).toBeInTheDocument()
  })

  it("marks external links with noopener and keeps anchors on the page", () => {
    render(<InlineText lang="en" text="[GitHub](https://github.com/kiarash-na/first-move) and [top](#top)" />)
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("rel", "noopener noreferrer")
    expect(screen.getByRole("link", { name: "top" })).toHaveAttribute("href", "#top")
  })

  it("shows markup as text instead of rendering it as HTML", () => {
    const { container } = render(<InlineText lang="en" text="<img src=x onerror=alert(1)> [x](javascript:alert(1))" />)
    expect(container.querySelector("img")).toBeNull()
    expect(container.querySelector("a")).toBeNull()
    expect(container).toHaveTextContent("<img src=x onerror=alert(1)> [x](javascript:alert(1))")
  })

  it("throws on an unknown token so a typo cannot be published", () => {
    expect(() => render(<InlineText lang="en" text="{{nope}}" />)).toThrow("Unknown legal token")
  })
})
