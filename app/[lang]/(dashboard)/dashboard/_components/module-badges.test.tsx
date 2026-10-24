import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import shell from "@/dictionaries/en/shell.json"
import { I18nProvider } from "./i18n-provider"
import { ModuleBadges } from "./module-badges"
import { testDictionaries } from "./test-utils/dictionaries"

describe("ModuleBadges", () => {
  it.each(["en", "de"] as const)("shows the modules that are on (%s)", (lang) => {
    render(
      <I18nProvider lang={lang} dictionaries={testDictionaries(lang)}>
        <ModuleBadges modules={{ quickCheck: false, businessPlan: true }} />
      </I18nProvider>,
    )
    expect(screen.queryByText(shell.fields.meta.modules.quickCheck.label)).not.toBeInTheDocument()
    expect(screen.getByText(shell.fields.meta.modules.businessPlan.label).className).toContain("text-hot")
  })
})
