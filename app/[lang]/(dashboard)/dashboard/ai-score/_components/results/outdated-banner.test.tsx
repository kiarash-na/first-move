import { screen, within } from "@testing-library/react"
import { beforeAll, describe, expect, it } from "vitest"
import { aiScoreStatus } from "@/lib/business-plan"
import { applyPatch } from "@/lib/project"
import { OutdatedBanner } from "./outdated-banner"
import { scored, type Scored } from "./test-utils/fixtures"
import { aiScoreCopy, renderResults } from "./test-utils/render"

let fixture: Scored
beforeAll(async () => {
  fixture = await scored()
})

describe("OutdatedBanner (D-73)", () => {
  it("lists the parts whose fields changed, with links to their steps", () => {
    const edited = applyPatch(fixture.project, { "businessPlan.assumptions.capex": "About 4 million euros.", "site.location": "Elsewhere" }).project
    const { changed } = aiScoreStatus(edited)
    expect(changed).toEqual(["site", "cost-basis"])
    renderResults(<OutdatedBanner score={fixture.score} changed={changed} />)
    const copy = aiScoreCopy("en")
    const banner = screen.getByRole("complementary", { name: copy.results.outdated.title })
    expect(banner).toHaveTextContent(copy.results.outdated.body)
    const items = within(banner).getAllByRole("listitem")
    expect(items.map((item) => item.querySelector("span")?.textContent)).toEqual([copy.labels.judgements.site, copy.labels.judgements["cost-basis"]])
    // Costs span the canvas (step 2) and the reality check (step 3).
    expect(within(items[1]).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      "/en/dashboard/business-plan/business-logic",
      "/en/dashboard/business-plan/reality-check",
    ])
  })

  it("renders nothing while the score is current", () => {
    const { container } = renderResults(<OutdatedBanner score={fixture.score} changed={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
