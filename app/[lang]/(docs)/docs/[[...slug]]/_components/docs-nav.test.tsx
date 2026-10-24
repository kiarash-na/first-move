import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import en from "@/dictionaries/en/docs.json"
import { DocsNav } from "./docs-nav"

describe("DocsNav", () => {
  it("lists the visible pages in the page language and marks the current one", () => {
    render(<DocsNav lang="de" current="quick-check" copy={en} live={false} />)
    const nav = screen.getByRole("navigation", { name: en.nav.label })
    const links = within(nav).getAllByRole("link")
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/de/docs",
      "/de/docs/what-is-5gdhc",
      "/de/docs/quick-check",
      "/de/docs/business-plan",
      "/de/docs/data-and-privacy",
    ])
    expect(within(nav).getByRole("link", { name: en.pages["quick-check"].title })).toHaveAttribute("aria-current", "page")
    expect(links.filter((link) => link.hasAttribute("aria-current"))).toHaveLength(1)
    expect(within(nav).getByText(en.nav.title)).toBeInTheDocument()
  })

  it("adds the AI pages once the AI features are live", () => {
    render(<DocsNav lang="en" current="assistant" copy={en} live={true} />)
    expect(screen.getByRole("link", { name: en.pages.assistant.title })).toHaveAttribute("href", "/en/docs/assistant")
    expect(screen.getByRole("link", { name: en.pages["email-agent"].title })).toHaveAttribute("href", "/en/docs/email-agent")
    expect(screen.getAllByRole("link")).toHaveLength(7)
  })
})
