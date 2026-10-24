import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { testDictionaries } from "../../../_components/test-utils/dictionaries"
import { exampleWith, renderOverview } from "../test-utils/overview-render"
import { DealBreakerTile } from "./deal-breaker-tile"

describe("DealBreakerTile", () => {
  it.each(["en", "de"] as const)("is titled and has a link into the module (%s)", (lang) => {
    const project = exampleWith("housing-cooperatives")
    renderOverview(<DealBreakerTile project={project} />, project, lang)
    expect(screen.getByRole("article", { name: testDictionaries(lang).overview.bp.dealBreaker.title })).toBeInTheDocument()
    expect(screen.getAllByRole("link").length).toBeGreaterThan(0)
    for (const link of screen.getAllByRole("link")) expect(link.getAttribute("href")).toMatch(new RegExp(`^/${lang}/dashboard/business-plan/`))
  })
})
