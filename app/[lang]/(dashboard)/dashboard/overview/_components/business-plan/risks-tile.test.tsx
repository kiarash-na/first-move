import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { exampleWith, renderOverview } from "../test-utils/overview-render"
import { RisksTile } from "./risks-tile"

describe("RisksTile", () => {
  it.each(["en", "de"] as const)("is titled and has a link into the module (%s)", (lang) => {
    const project = exampleWith("housing-cooperatives")
    renderOverview(<RisksTile project={project} />, project, lang)
    expect(screen.getByRole("article", { name: "Top risks" })).toBeInTheDocument()
    expect(screen.getAllByRole("link").length).toBeGreaterThan(0)
    for (const link of screen.getAllByRole("link")) expect(link.getAttribute("href")).toMatch(new RegExp(`^/${lang}/dashboard/business-plan/`))
  })
})
