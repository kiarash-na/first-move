import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { MessageText } from "./message-text"

const HOSTILE = [
  "Here is **the result** and `EQ-3.4a`.",
  "<script>alert(1)</script> <img src=x onerror=alert(2)> <a href=\"https://evil.example\">click</a>",
  "![tracking pixel](https://evil.example/pixel.png?project=secret)",
  "See [the docs](/en/docs/quick-check#results), [elsewhere](https://evil.example/phish) and [this](javascript:alert(3)).",
  "",
  "- first",
  "- second",
].join("\n")

describe("MessageText (D-51 safe rendering)", () => {
  it("renders the Markdown subset as text and never interprets HTML", () => {
    const { container } = render(<MessageText text={HOSTILE} />)
    expect(container.querySelector("script, img, iframe, style")).toBeNull()
    expect(container.querySelector("[onerror]")).toBeNull()
    expect(container).toHaveTextContent("<script>alert(1)</script>")
    expect(container).toHaveTextContent('<img src=x onerror=alert(2)>')
    expect(screen.getByText("the result").tagName).toBe("STRONG")
    expect(screen.getByText("EQ-3.4a").tagName).toBe("CODE")
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["first", "second"])
  })

  it("loads no image and links only to First Move pages", () => {
    const { container } = render(<MessageText text={HOSTILE} />)
    expect(container).toHaveTextContent("tracking pixel")
    const links = screen.getAllByRole("link")
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveTextContent("the docs")
    expect(links[0]).toHaveAttribute("href", "/en/docs/quick-check#results")
    expect(container.querySelectorAll("a")).toHaveLength(1)
    expect(container.querySelector("[href*='evil'], [href^='javascript'], [src]")).toBeNull()
    expect(container).toHaveTextContent("elsewhere")
  })
})
