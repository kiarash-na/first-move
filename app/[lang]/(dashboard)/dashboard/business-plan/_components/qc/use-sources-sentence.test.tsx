import { renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it } from "vitest"
import { I18nProvider } from "../../../_components/i18n-provider"
import { testDictionaries } from "../../../_components/test-utils/dictionaries"
import { useSourcesSentence } from "./use-sources-sentence"

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider lang="en" dictionaries={testDictionaries("en")}>
    {children}
  </I18nProvider>
)

describe("useSourcesSentence", () => {
  it("names the selected sources with their potential", () => {
    const { result } = renderHook(
      () =>
        useSourcesSentence({
          totalBuildings: 8,
          areaM2: 1,
          sources: [
            { source: "waste_heat", potential: "high" },
            { source: "ground_water", potential: "medium" },
          ],
        }),
      { wrapper },
    )
    expect(result.current).toBe("Sources screened in the Quick Check: Waste heat (High), Ground water (Medium).")
  })

  it("is null without sources", () => {
    const { result } = renderHook(() => useSourcesSentence({ totalBuildings: null, areaM2: null, sources: [] }), { wrapper })
    expect(result.current).toBeNull()
  })
})
