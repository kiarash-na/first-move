import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it } from "vitest"
import { ProjectStoreProvider } from "./store-provider"
import { exampleProject, projectStore } from "./test-utils/project-store"
import { fakeStore } from "./test-utils/fake-store"
import { quickCheckOf, useQuickCheck } from "./use-quick-check"

describe("useQuickCheck", () => {
  it("runs the open project once per state and follows edits", () => {
    const { store, patch } = projectStore(exampleProject("school-kindergarten-flats"))
    const wrapper = ({ children }: { children: ReactNode }) => <ProjectStoreProvider store={store}>{children}</ProjectStoreProvider>
    const { result } = renderHook(() => useQuickCheck(), { wrapper })
    const first = result.current.result
    expect(first?.status).toBe("complete")
    expect(quickCheckOf(result.current.project!)).toBe(first)
    act(() => {
      patch({ "sources.potentials.geothermal": "unknown" })
    })
    expect(result.current.result).not.toBe(first)
    expect(result.current.result?.flags.unknownSources).toBe(true)
  })

  it("is empty without an open project", () => {
    const { store } = fakeStore()
    const wrapper = ({ children }: { children: ReactNode }) => <ProjectStoreProvider store={store}>{children}</ProjectStoreProvider>
    const { result } = renderHook(() => useQuickCheck(), { wrapper })
    expect(result.current).toEqual({ project: null, result: null })
  })
})
