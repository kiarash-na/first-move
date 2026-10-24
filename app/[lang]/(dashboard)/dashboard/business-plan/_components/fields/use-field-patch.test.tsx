import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, describe, expect, it } from "vitest"
import { I18nProvider } from "../../../_components/i18n-provider"
import { ProjectStoreProvider } from "../../../_components/store-provider"
import { testDictionaries } from "../../../_components/test-utils/dictionaries"
import { openProject, stopTabs } from "../test-utils/open-project"
import { useFieldPatch } from "./use-field-patch"

afterEach(stopTabs)

describe("useFieldPatch", () => {
  it("patches the store and reports the first error in the UI language, clearing it on success", async () => {
    const tab = await openProject()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <I18nProvider lang="de" dictionaries={testDictionaries("de")}>
        <ProjectStoreProvider store={tab.store}>{children}</ProjectStoreProvider>
      </I18nProvider>
    )
    const { result } = renderHook(() => useFieldPatch(), { wrapper })
    expect(result.current.error).toBeNull()

    act(() => {
      result.current.patch({ "site.nope": "x" })
    })
    expect(result.current.error).toEqual(expect.any(String))

    act(() => {
      result.current.patch({ "site.name": "Dorf" })
    })
    expect(result.current.error).toBeNull()
    expect(tab.store.getState().active?.site.name).toBe("Dorf")
  })

  it("says so when no project is open", async () => {
    const tab = await openProject()
    await tab.store.close()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <I18nProvider lang="en" dictionaries={testDictionaries("en")}>
        <ProjectStoreProvider store={tab.store}>{children}</ProjectStoreProvider>
      </I18nProvider>
    )
    const { result } = renderHook(() => useFieldPatch(), { wrapper })
    act(() => {
      expect(result.current.patch({ "site.name": "x" })).toBeNull()
    })
    expect(result.current.error).toBe("Could not save this change.")
  })
})
