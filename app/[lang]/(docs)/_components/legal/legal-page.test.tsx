import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import en from "@/dictionaries/en/legal.json"
import type { LegalDocCopy } from "@/lib/legal/types"
import { LegalPage } from "./legal-page"

const doc: LegalDocCopy = {
  meta: { title: "Terms", description: "Terms" },
  title: "Terms of Use",
  intro: "Read the [Privacy Policy](/privacy).",
  updated: "2026-10-24",
  version: "1.0",
  sections: [
    { id: "scope", heading: "Scope", body: ["First paragraph.", "- a", "- b"] },
    { id: "liability", heading: "Liability", body: ["Second paragraph."] },
  ],
}

describe("LegalPage", () => {
  it("shows the title, the version and the date in the page language", () => {
    render(<LegalPage doc={doc} lang="en" legal={en} />)
    expect(screen.getByRole("heading", { level: 1, name: "Terms of Use" })).toBeInTheDocument()
    expect(screen.getByText(/Last updated 24 Oct 2026 · Version 1\.0/)).toBeInTheDocument()
  })

  it("formats the date the German way, without time-zone drift", () => {
    render(<LegalPage doc={doc} lang="de" legal={en} />)
    expect(screen.getByText(/24\.10\.2026/)).toBeInTheDocument()
  })

  it("numbers the sections and lists them in a table of contents with matching anchors", () => {
    render(<LegalPage doc={doc} lang="en" legal={en} />)
    const toc = screen.getByRole("navigation", { name: en.page.contents })
    const links = within(toc).getAllByRole("link")
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["#scope", "#liability"])
    expect(screen.getByRole("heading", { level: 2, name: "Liability" })).toBeInTheDocument()
    expect(document.getElementById("liability")).toContainElement(screen.getByText("Second paragraph."))
    // A section is not a landmark, so a table inside it cannot repeat a landmark name.
    expect(screen.queryAllByRole("region")).toHaveLength(0)
  })

  it("localizes links in the intro", () => {
    render(<LegalPage doc={doc} lang="de" legal={en} />)
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/de/privacy")
  })

  it("shows the review notice on German pages only (D-44)", () => {
    const { rerender } = render(<LegalPage doc={doc} lang="de" legal={en} />)
    expect(screen.getByText(en.page.reviewNotice)).toBeInTheDocument()
    rerender(<LegalPage doc={doc} lang="en" legal={en} />)
    expect(screen.queryByText(en.page.reviewNotice)).toBeNull()
  })

  it("shows a status line and extra content behind a section", () => {
    render(
      <LegalPage doc={doc} lang="en" legal={en} status="Not available yet." after={{ scope: <p>Extra table</p> }} />,
    )
    expect(screen.getByText("Not available yet.")).toHaveAttribute("role", "note")
    expect(document.getElementById("scope")).toContainElement(screen.getByText("Extra table"))
    expect(document.getElementById("liability")).not.toContainElement(screen.getByText("Extra table"))
  })
})
