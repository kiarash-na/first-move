import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { referenceOf } from "@/lib/docs/references"
import { formatDate } from "@/lib/i18n/format"
import { ReferenceItem } from "./reference-item"
import { aiScoreCopy, renderResults } from "./test-utils/render"

const copy = aiScoreCopy("en")

function renderReference(id: string, lang: "en" | "de" = "en") {
  const reference = referenceOf(id)!
  renderResults(
    <ul>
      <ReferenceItem reference={reference} />
    </ul>,
    { lang },
  )
  return reference
}

describe("ReferenceItem", () => {
  it("cites authors, year, title, source and kind, with a safe external link", () => {
    const reference = renderReference("SRC-LYGNERUD-2019")
    expect(screen.getByText(`${reference.authors} (${reference.year})`)).toBeInTheDocument()
    expect(screen.getByText(reference.source)).toBeInTheDocument()
    expect(screen.getByText(copy.results.sources.kinds["peer-reviewed"])).toBeInTheDocument()
    const link = screen.getByRole("link", { name: `${reference.title} (opens in a new tab)` })
    expect(link).toHaveAttribute("href", reference.url)
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noopener noreferrer")
    expect(screen.getByText(`Link checked on ${formatDate(reference.checked, "en")}`)).toBeInTheDocument()
  })

  it("names the dimensions that cite it", () => {
    renderReference("SRC-WRG-1959")
    expect(screen.getByText(`Cited in: ${copy.labels.dimensions.technology.name}`)).toBeInTheDocument()
  })

  it("names its role in the method", () => {
    renderReference("SRC-GEVAL-2023")
    expect(screen.getByText(copy.results.sources.roles.aggregation)).toBeInTheDocument()
  })
})
