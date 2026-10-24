import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { exampleWith, renderOverview } from "../test-utils/overview-render"
import { StepProgressTile } from "./step-progress-tile"

const format = vi.hoisted(() => ({ calls: [] as Array<[number, string]> }))
vi.mock("@/lib/i18n/format", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/i18n/format")>()
  return {
    ...original,
    formatNumber: (value: number, lang: Parameters<typeof original.formatNumber>[1], options?: Intl.NumberFormatOptions) => {
      format.calls.push([value, lang])
      return original.formatNumber(value, lang, options)
    },
  }
})

describe("StepProgressTile", () => {
  it.each(["en", "de"] as const)("is titled and has a link into the module (%s)", (lang) => {
    const project = exampleWith("housing-cooperatives")
    renderOverview(<StepProgressTile project={project} />, project, lang)
    expect(screen.getByRole("article", { name: "Step progress" })).toBeInTheDocument()
    expect(screen.getAllByRole("link").length).toBeGreaterThan(0)
    for (const link of screen.getAllByRole("link")) expect(link.getAttribute("href")).toMatch(new RegExp(`^/${lang}/dashboard/business-plan/`))
  })

  it("formats the done/total counts per language (lib/i18n/format)", () => {
    const project = exampleWith("housing-cooperatives")
    format.calls.length = 0
    renderOverview(<StepProgressTile project={project} />, project, "de")
    expect(format.calls.filter(([, lang]) => lang === "de").length).toBeGreaterThanOrEqual(8)
  })
})
