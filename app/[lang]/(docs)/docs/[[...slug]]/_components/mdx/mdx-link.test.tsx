import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MdxLink } from "./mdx-link"

describe("MdxLink", () => {
  it("opens a site path in the page's language, anchors included", () => {
    render(
      <>
        <MdxLink href="/docs/quick-check#supply" lang="de">
          Supply
        </MdxLink>
        <MdxLink href="/privacy#email" lang="en">
          Privacy
        </MdxLink>
      </>,
    )
    expect(screen.getByRole("link", { name: "Supply" })).toHaveAttribute("href", "/de/docs/quick-check#supply")
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/en/privacy#email")
  })

  it("keeps an anchor on the page and a mail address as it is", () => {
    render(
      <>
        <MdxLink href="#supply" lang="en">
          below
        </MdxLink>
        <MdxLink href="mailto:human@mail.firstmove.energy" lang="en">
          human@mail.firstmove.energy
        </MdxLink>
      </>,
    )
    expect(screen.getByRole("link", { name: "below" })).toHaveAttribute("href", "#supply")
    expect(screen.getByRole("link", { name: "human@mail.firstmove.energy" })).toHaveAttribute("href", "mailto:human@mail.firstmove.energy")
  })

  it("opens an https link without a referrer or opener", () => {
    render(
      <MdxLink href="https://example.org" lang="en">
        Example
      </MdxLink>,
    )
    expect(screen.getByRole("link", { name: "Example" })).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("keeps any other target as plain text", () => {
    render(
      <MdxLink href="javascript:alert(1)" lang="en">
        Click
      </MdxLink>,
    )
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
    expect(screen.getByText("Click")).toBeInTheDocument()
  })
})
