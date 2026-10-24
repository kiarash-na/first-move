import { screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { renderDashboard } from "../../_components/test-utils/render"
import { openProject, stopTabs } from "./test-utils/open-project"
import { StepNav } from "./step-nav"

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

afterEach(stopTabs)

const copy = {
  en: { nav: "Business Plan steps", progress: (done: number) => new RegExp(`^${done} of \\d+ filled in$`) },
  de: { nav: "Schritte des Business Plan", progress: (done: number) => new RegExp(`^${done} von \\d+ ausgefüllt$`) },
}

describe("StepNav (BM-SCOPE-11, D-28)", () => {
  it.each(["en", "de"] as const)("links all four steps in any order with progress per step (%s)", async (lang) => {
    const tab = await openProject()
    tab.store.patch({ "site.name": "Village", "businessPlan.scalability.geographical": "Other valleys" })
    renderDashboard(<StepNav current="business-logic" />, { store: tab.store, lang })
    const nav = screen.getByRole("navigation", { name: copy[lang].nav })
    const links = within(nav).getAllByRole("link")
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      ["opportunity", "business-logic", "reality-check", "implementation"].map((step) => `/${lang}/dashboard/business-plan/${step}`),
    )
    expect(links[1]).toHaveAttribute("aria-current", "step")
    expect(links[0]).not.toHaveAttribute("aria-current")
    expect(within(links[0]).getByText(copy[lang].progress(1))).toBeInTheDocument()
    expect(within(links[2]).getByText(copy[lang].progress(0))).toBeInTheDocument()
    expect(within(links[3]).getByText(copy[lang].progress(1))).toBeInTheDocument()
  })

  it("marks a finished step as done", async () => {
    const tab = await openProject({ example: "housing-cooperatives" })
    renderDashboard(<StepNav current="opportunity" />, { store: tab.store })
    expect(screen.getAllByText("Done")).toHaveLength(4)
    expect(screen.getAllByText("100%")).toHaveLength(4)
  })

  it("keeps the done mark out of the title's row so long titles wrap instead of running under it (375px)", async () => {
    const tab = await openProject({ example: "housing-cooperatives" })
    const { container } = renderDashboard(<StepNav current="opportunity" />, { store: tab.store })
    const title = screen.getByText("Implementation")
    expect(title).toHaveAttribute("data-slot", "step-title")
    expect(title.className).toContain("[overflow-wrap:anywhere]")
    const marks = container.querySelectorAll("[data-slot=step-done]")
    expect(marks).toHaveLength(4)
    marks.forEach((mark) => expect(mark.parentElement?.contains(screen.getByText("Implementation"))).toBe(false))
  })

  it("formats the per-step counts per language (lib/i18n/format)", async () => {
    const tab = await openProject({ example: "housing-cooperatives" })
    format.calls.length = 0
    renderDashboard(<StepNav current="opportunity" />, { store: tab.store, lang: "de" })
    expect(format.calls.filter(([, lang]) => lang === "de")).toHaveLength(8)
  })
})
