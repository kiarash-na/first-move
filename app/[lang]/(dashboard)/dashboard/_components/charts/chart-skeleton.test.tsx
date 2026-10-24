import { screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { testDictionaries } from "../test-utils/dictionaries"
import { renderDashboard } from "../test-utils/render"
import { ChartSkeleton } from "./chart-skeleton"

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

describe("ChartSkeleton", () => {
  it.each(["en", "de"] as const)("announces that the chart is loading (%s)", (lang) => {
    const tab = testTab()
    tabs.push(tab)
    renderDashboard(<ChartSkeleton />, { store: tab.store, lang })
    expect(screen.getByRole("status", { busy: true })).toHaveTextContent(testDictionaries(lang).overview.charts.loading)
  })
})
