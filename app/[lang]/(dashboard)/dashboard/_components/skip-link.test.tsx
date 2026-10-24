import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { SkipLink } from "./skip-link"
import { testDictionaries } from "./test-utils/dictionaries"
import { emptyProject, projectStore } from "./test-utils/project-store"
import { renderDashboard } from "./test-utils/render"

describe("SkipLink", () => {
  it.each(["en", "de"] as const)("links to the main content with the dictionary text (%s)", (lang) => {
    const { store } = projectStore(emptyProject())
    renderDashboard(<SkipLink />, { store, lang })
    expect(screen.getByRole("link", { name: testDictionaries(lang).shell.skipToContent })).toHaveAttribute("href", "#main")
  })
})
