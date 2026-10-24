import { renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it } from "vitest"
import { I18nProvider } from "../i18n-provider"
import { ProjectStoreProvider } from "../store-provider"
import { testDictionaries } from "../test-utils/dictionaries"
import { emptyProject, projectStore } from "../test-utils/project-store"
import { useFieldPatch, useValidationMessage } from "./use-field-patch"

describe("useFieldPatch", () => {
  it("patches through the store and returns the applyPatch errors", () => {
    const { store, current } = projectStore(emptyProject())
    const wrapper = ({ children }: { children: ReactNode }) => (
      <I18nProvider lang="de" dictionaries={testDictionaries("de")}>
        <ProjectStoreProvider store={store}>{children}</ProjectStoreProvider>
      </I18nProvider>
    )
    const { result } = renderHook(() => ({ patch: useFieldPatch(), message: useValidationMessage() }), { wrapper })
    expect(result.current.patch({ "buildings.total": 3 })).toEqual([])
    expect(current().buildings.total).toBe(3)
    const [error] = result.current.patch({ "buildings.total": 200_000 })
    expect(error).toMatchObject({ path: "buildings.total", code: "max" })
    expect(result.current.message(error)).toBe("Enter 100.000 or less.")
  })
})
