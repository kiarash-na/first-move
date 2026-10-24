import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import shell from "@/dictionaries/en/shell.json"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { ProjectGate } from "./project-gate"
import { testDictionaries } from "./test-utils/dictionaries"
import { renderDashboard } from "./test-utils/render"

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

function tab() {
  const created = testTab()
  tabs.push(created)
  return created
}

describe("ProjectGate", () => {
  it("shows a skeleton until the store is ready", () => {
    const { store } = tab()
    renderDashboard(<ProjectGate>content</ProjectGate>, { store })
    expect(screen.getByLabelText(shell.loading)).toHaveAttribute("aria-busy", "true")
    expect(screen.queryByText("content")).not.toBeInTheDocument()
  })

  it.each(["en", "de"] as const)("links back to the start screen when no project is open (%s)", async (lang) => {
    const { store } = tab()
    await store.start()
    const { gate } = testDictionaries(lang).shell
    renderDashboard(<ProjectGate>content</ProjectGate>, { store, lang })
    expect(await screen.findByRole("heading", { name: gate.noProject.title })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: gate.noProject.action })).toHaveAttribute("href", `/${lang}/dashboard`)
  })

  it("offers to turn a module on, then shows the page", async () => {
    const { store } = tab()
    await store.start()
    await store.create({ modules: { businessPlan: true } })
    renderDashboard(<ProjectGate module="quickCheck">content</ProjectGate>, { store })
    await userEvent.click(await screen.findByRole("button", { name: "Turn on Quick Check" }))
    await waitFor(() => expect(screen.getByText("content")).toBeInTheDocument())
    expect(store.getState().active?.meta.modules.quickCheck).toBe(true)
  })

  it("renders the page when the module is on", async () => {
    const { store } = tab()
    await store.start()
    await store.create({ modules: { quickCheck: true } })
    renderDashboard(<ProjectGate module="quickCheck">content</ProjectGate>, { store })
    expect(await screen.findByText("content")).toBeInTheDocument()
  })
})
