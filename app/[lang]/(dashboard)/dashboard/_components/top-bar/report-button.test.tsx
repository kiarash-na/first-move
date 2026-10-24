import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { exampleProject } from "../test-utils/project-store"
import { testDictionaries } from "../test-utils/dictionaries"
import { fakeStore } from "../test-utils/fake-store"
import { renderDashboard } from "../test-utils/render"
import { ReportButton } from "./report-button"

describe("ReportButton (D-09, D-70)", () => {
  it.each(["en", "de"] as const)("links to the report of the open project (%s)", (lang) => {
    const { shell } = testDictionaries(lang)
    const project = exampleProject("housing-cooperatives")
    renderDashboard(<ReportButton />, { store: fakeStore({ active: project, activeId: project.meta.id }).store, lang })
    expect(screen.getByRole("link", { name: shell.topBar.report })).toHaveAttribute("href", `/${lang}/dashboard/report`)
  })

  it("is disabled while no project is open", () => {
    const { shell } = testDictionaries("en")
    renderDashboard(<ReportButton />, { store: fakeStore().store, lang: "en" })
    expect(screen.getByRole("button", { name: shell.topBar.report })).toBeDisabled()
  })
})
