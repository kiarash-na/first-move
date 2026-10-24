import { render, screen } from "@testing-library/react"
import type * as React from "react"
import { describe, expect, it } from "vitest"
import { docsMdxComponents } from "./docs-mdx-components"
import { MdxH1 } from "./mdx-h1"
import { MdxH2 } from "./mdx-h2"
import { MdxNote } from "./mdx-note"

type Component = (props: { href?: string; children?: React.ReactNode }) => React.ReactNode

describe("docsMdxComponents", () => {
  it("maps the Markdown elements of a docs page to the docs components", () => {
    const components = docsMdxComponents({ lang: "en", live: false })
    expect(Object.keys(components).sort()).toEqual(["AiOnly", "a", "blockquote", "code", "h1", "h2", "ol", "p", "strong", "ul"])
    expect(components.h1).toBe(MdxH1)
    expect(components.h2).toBe(MdxH2)
    expect(components.blockquote).toBe(MdxNote)
  })

  it("opens links in the page's language", () => {
    const Link = docsMdxComponents({ lang: "de", live: false }).a as Component
    render(<Link href="/docs/business-plan">Business Plan</Link>)
    expect(screen.getByRole("link", { name: "Business Plan" })).toHaveAttribute("href", "/de/docs/business-plan")
  })

  it("lets <AiOnly> follow the AI switch", () => {
    const Dark = docsMdxComponents({ lang: "en", live: false }).AiOnly as Component
    const Live = docsMdxComponents({ lang: "en", live: true }).AiOnly as Component
    render(
      <>
        <Dark>hidden while dark</Dark>
        <Live>shown when live</Live>
      </>,
    )
    expect(screen.queryByText("hidden while dark")).not.toBeInTheDocument()
    expect(screen.getByText("shown when live")).toBeInTheDocument()
  })
})
