import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { RESULT_LEVELS } from "@/lib/quick-check"
import { I18nProvider } from "./i18n-provider"
import { testDictionaries } from "./test-utils/dictionaries"
import { VerdictBadge } from "./verdict-badge"

describe("VerdictBadge", () => {
  it.each(["en", "de"] as const)("labels every level with text and an icon (%s)", (lang) => {
    render(
      <I18nProvider lang={lang} dictionaries={testDictionaries(lang)}>
        {RESULT_LEVELS.map((level) => (
          <VerdictBadge key={level} level={level} />
        ))}
      </I18nProvider>,
    )
    for (const level of RESULT_LEVELS) {
      const badge = screen.getByText(testDictionaries(lang)["quick-check"].results.levels[level].label)
      expect(badge).toHaveAttribute("data-level", level)
      expect(badge.querySelector("svg")).not.toBeNull()
    }
  })

  it("uses cyan for promising and orange for not promising", () => {
    render(
      <I18nProvider lang="en" dictionaries={testDictionaries("en")}>
        <VerdictBadge level="promising" />
        <VerdictBadge level="not_promising" />
      </I18nProvider>,
    )
    expect(screen.getByText(quickCheck.results.levels.promising.label).className).toContain("text-primary")
    expect(screen.getByText(quickCheck.results.levels.not_promising.label).className).toContain("text-hot")
  })
})
