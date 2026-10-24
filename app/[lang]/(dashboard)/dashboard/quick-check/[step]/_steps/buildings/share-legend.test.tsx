import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { BUILDING_TYPES } from "@/lib/project"
import { I18nProvider } from "../../../../_components/i18n-provider"
import { testDictionaries } from "../../../../_components/test-utils/dictionaries"
import { ShareLegend } from "./share-legend"

describe("ShareLegend", () => {
  it("describes every building type (QCT-REF-TYPES)", () => {
    render(
      <I18nProvider lang="en" dictionaries={testDictionaries("en")}>
        <ShareLegend types={BUILDING_TYPES} />
      </I18nProvider>,
    )
    for (const type of BUILDING_TYPES) expect(screen.getByText(quickCheck.buildingTypes[type].description)).toBeInTheDocument()
  })
})
