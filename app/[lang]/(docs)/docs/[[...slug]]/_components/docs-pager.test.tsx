import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import en from "@/dictionaries/en/docs.json"
import { DocsPager } from "./docs-pager"

describe("DocsPager", () => {
  it("links the previous and the next page by their titles", () => {
    render(<DocsPager lang="de" slug="quick-check" copy={en} live={false} />)
    expect(screen.getByRole("navigation", { name: en.pager.label })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: `${en.pager.previous} ${en.pages["what-is-5gdhc"].title}` })).toHaveAttribute(
      "href",
      "/de/docs/what-is-5gdhc",
    )
    expect(screen.getByRole("link", { name: `${en.pager.next} ${en.pages["business-plan"].title}` })).toHaveAttribute(
      "href",
      "/de/docs/business-plan",
    )
  })

  it("has only a next link on the first page and only a previous link on the last", () => {
    const { unmount } = render(<DocsPager lang="en" slug="index" copy={en} live={false} />)
    expect(screen.getAllByRole("link")).toHaveLength(1)
    expect(screen.getByRole("link")).toHaveAttribute("rel", "next")
    unmount()
    render(<DocsPager lang="en" slug="data-and-privacy" copy={en} live={false} />)
    expect(screen.getAllByRole("link")).toHaveLength(1)
    expect(screen.getByRole("link")).toHaveAttribute("rel", "prev")
  })

  it("leads to the AI pages once they are live", () => {
    render(<DocsPager lang="en" slug="business-plan" copy={en} live={true} />)
    expect(screen.getByRole("link", { name: `${en.pager.next} ${en.pages.assistant.title}` })).toHaveAttribute("href", "/en/docs/assistant")
  })
})
