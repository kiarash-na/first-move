import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, describe, expect, it } from "vitest"
import { ProjectStoreProvider } from "../../../_components/store-provider"
import { openProject, stopTabs } from "../test-utils/open-project"
import { useQcPrefill } from "./use-qc-prefill"

afterEach(stopTabs)

describe("useQcPrefill", () => {
  it("recomputes for Quick Check changes but not for Business Plan typing", async () => {
    const tab = await openProject({ example: "housing-cooperatives" })
    const wrapper = ({ children }: { children: ReactNode }) => <ProjectStoreProvider store={tab.store}>{children}</ProjectStoreProvider>
    const { result } = renderHook(() => useQcPrefill(), { wrapper })
    const first = result.current
    expect(first?.status).toBe("ready")

    act(() => {
      tab.store.patch({ "businessPlan.opportunity.painPoint": "typing in a text" })
    })
    expect(result.current).toBe(first)

    act(() => {
      tab.store.patch({ "buildings.total": 9 })
    })
    expect(result.current).not.toBe(first)

    act(() => {
      tab.store.patch({ "meta.modules.quickCheck": false })
    })
    expect(result.current?.status).toBe("off")
  })

  it("is null without an open project", async () => {
    const tab = await openProject()
    await tab.store.close()
    const wrapper = ({ children }: { children: ReactNode }) => <ProjectStoreProvider store={tab.store}>{children}</ProjectStoreProvider>
    const { result } = renderHook(() => useQcPrefill(), { wrapper })
    expect(result.current).toBeNull()
  })
})
