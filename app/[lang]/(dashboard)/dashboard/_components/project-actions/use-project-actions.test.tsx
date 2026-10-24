import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { renderDashboard } from "../test-utils/render"
import { useProjectActions } from "./use-project-actions"

const push = vi.hoisted(() => vi.fn())
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
  push.mockClear()
})

function Probe({ id }: { id: string }) {
  const actions = useProjectActions()
  return (
    <>
      <button onClick={() => void actions.open(id)}>open</button>
      <button onClick={() => void actions.duplicate(id, "Quarry")}>duplicate</button>
      <button onClick={() => void actions.open("missing")}>missing</button>
    </>
  )
}

describe("useProjectActions", () => {
  it("opens a project at its overview and duplicates it under a copy name", async () => {
    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    const project = await tab.store.create({ modules: { quickCheck: true }, name: "Quarry", open: false })
    renderDashboard(<Probe id={project.meta.id} />, { store: tab.store, lang: "de" })
    await userEvent.click(screen.getByRole("button", { name: "open" }))
    await waitFor(() => expect(push).toHaveBeenCalledWith("/de/dashboard/overview"))
    expect(tab.store.getState().activeId).toBe(project.meta.id)

    await userEvent.click(screen.getByRole("button", { name: "duplicate" }))
    await waitFor(() => expect(tab.store.getState().projects.map((entry) => entry.name)).toContain("Quarry (Kopie)"))
  })

  it("does not navigate when the project is gone", async () => {
    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    renderDashboard(<Probe id="x" />, { store: tab.store })
    await userEvent.click(screen.getByRole("button", { name: "missing" }))
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(push).not.toHaveBeenCalled()
  })
})
