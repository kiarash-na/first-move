import { render, screen, waitFor } from "@testing-library/react"
import { StrictMode } from "react"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"
import { selectSaveStatus } from "./save-status"
import { testBrowser, testTab, type TestTab } from "./test-utils/harness"
import { useProjectStore, useStartProjectStore } from "./use-project-store"
import type { ProjectStore } from "./create-project-store"

const tabs: TestTab[] = []

afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

function Probe({ store }: { store: ProjectStore }) {
  useStartProjectStore(store)
  const phase = useProjectStore((state) => state.phase, store)
  const count = useProjectStore((state) => state.projects.length, store)
  const status = useProjectStore(selectSaveStatus, store)
  return <p>{`${phase} · ${count} · ${status.kind}`}</p>
}

describe("useProjectStore", () => {
  it("renders the empty server snapshot on the server, without touching storage", () => {
    const tab = testTab(testBrowser())
    tabs.push(tab)
    const openDb = vi.spyOn(tab.deps, "openDb")
    expect(renderToString(<Probe store={tab.store} />)).toContain("idle · 0 · idle")
    expect(openDb).not.toHaveBeenCalled()
  })

  it("starts once in an effect (Strict Mode runs effects twice) and shows the loaded data", async () => {
    const browser = testBrowser()
    const seed = testTab(browser)
    tabs.push(seed)
    await seed.store.create({ modules: { quickCheck: true } })
    seed.store.stop()

    const tab = testTab(browser, { session: seed.session })
    tabs.push(tab)
    const openDb = vi.spyOn(tab.deps, "openDb")
    render(
      <StrictMode>
        <Probe store={tab.store} />
      </StrictMode>,
    )
    await waitFor(() => expect(screen.getByText("ready · 1 · saved")).toBeInTheDocument())
    expect(openDb).toHaveBeenCalledTimes(1)
  })
})
