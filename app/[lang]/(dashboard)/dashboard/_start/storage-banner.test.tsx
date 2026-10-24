import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { UNKNOWN_HEALTH } from "@/lib/storage/persist"
import { testDictionaries } from "../_components/test-utils/dictionaries"
import { fakeStore } from "../_components/test-utils/fake-store"
import { renderDashboard } from "../_components/test-utils/render"
import { StorageBanner } from "./storage-banner"

describe("StorageBanner", () => {
  it.each(["en", "de"] as const)("shows the storage warning (%s)", (lang) => {
    const { store } = fakeStore({ health: { ...UNKNOWN_HEALTH, warning: "unavailable" } })
    renderDashboard(<StorageBanner />, { store, lang })
    expect(screen.getByRole("status")).toHaveTextContent(testDictionaries(lang).shell.storage.warning.unavailable)
  })

  it("stays hidden without a warning or before the store is ready", () => {
    const { store } = fakeStore()
    const { container } = renderDashboard(<StorageBanner />, { store })
    expect(container).toBeEmptyDOMElement()
    const loading = fakeStore({ phase: "loading", health: { ...UNKNOWN_HEALTH, warning: "low-space" } })
    const second = renderDashboard(<StorageBanner />, { store: loading.store })
    expect(second.container).toBeEmptyDOMElement()
  })
})
