import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { STEP_EXPLAIN } from "@/lib/quick-check"
import { I18nProvider } from "./i18n-provider"
import { PlaceholderPage } from "./placeholder-page"
import { testDictionaries } from "./test-utils/dictionaries"

describe("PlaceholderPage", () => {
  it.each(["en", "de"] as const)("shows the header, the in-development note and the step's How we calculate (%s)", (lang) => {
    const { shell, calc } = testDictionaries(lang)
    render(
      <I18nProvider lang={lang} dictionaries={testDictionaries(lang)}>
        <PlaceholderPage eyebrow="Quick Check · 01" title="Project area" tone="cool" explain={STEP_EXPLAIN.area} />
      </I18nProvider>,
    )
    expect(screen.getByRole("heading", { level: 1, name: "Project area" })).toBeInTheDocument()
    expect(screen.getByText(shell.placeholder.badge)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: calc.ui.title })).toHaveAttribute("aria-expanded", "false")
  })

  it("has no How we calculate without an explanation", () => {
    render(
      <I18nProvider lang="en" dictionaries={testDictionaries("en")}>
        <PlaceholderPage eyebrow="Business Plan" title="Opportunity" tone="hot" />
      </I18nProvider>,
    )
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })
})
