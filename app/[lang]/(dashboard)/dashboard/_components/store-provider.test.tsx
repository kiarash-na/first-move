import { render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { getProjectStore } from "@/lib/store"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { ProjectStoreProvider, useStore, useStoreState } from "./store-provider"

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

function Probe() {
  const store = useStore()
  const phase = useStoreState((state) => state.phase)
  return <p data-default={String(store === getProjectStore())}>{phase}</p>
}

describe("ProjectStoreProvider", () => {
  it("uses the provided store", async () => {
    const tab = testTab()
    tabs.push(tab)
    render(
      <ProjectStoreProvider store={tab.store}>
        <Probe />
      </ProjectStoreProvider>,
    )
    expect(screen.getByText("idle")).toHaveAttribute("data-default", "false")
    await tab.store.start()
    await waitFor(() => expect(screen.getByText("ready")).toBeInTheDocument())
  })

  it("falls back to the app singleton without starting it", () => {
    render(<Probe />)
    expect(screen.getByText("idle")).toHaveAttribute("data-default", "true")
  })
})
