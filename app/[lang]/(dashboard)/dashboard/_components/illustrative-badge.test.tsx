import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { IllustrativeBadge } from "./illustrative-badge"
import { testDictionaries } from "./test-utils/dictionaries"
import { renderDashboard } from "./test-utils/render"
import { emptyProject, exampleProject, projectStore } from "./test-utils/project-store"

describe("IllustrativeBadge (OQ-23)", () => {
  it.each(["en", "de"] as const)("labels an opened example 'Illustrative inputs only' (%s)", (lang) => {
    const { store } = projectStore(exampleProject("new-build-quarter"))
    renderDashboard(<IllustrativeBadge />, { store, lang })
    expect(screen.getByText(testDictionaries(lang).shell.illustrative)).toHaveAttribute("data-slot", "illustrative")
  })

  it("shows nothing for an own project", () => {
    const { store } = projectStore(emptyProject())
    const { container } = renderDashboard(<IllustrativeBadge />, { store })
    expect(container.querySelector("[data-slot=illustrative]")).toBeNull()
  })
})
