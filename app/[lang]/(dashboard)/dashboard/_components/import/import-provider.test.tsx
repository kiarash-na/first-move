import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { testDictionaries } from "../test-utils/dictionaries"
import { renderDashboard } from "../test-utils/render"
import { ImportProvider, useImport } from "./import-provider"

const push = vi.hoisted(() => vi.fn())
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
  push.mockClear()
})

let file: File
function Picker() {
  const { importFile } = useImport()
  return <button onClick={() => void importFile(file)}>pick</button>
}

async function storeWithProject() {
  const tab = testTab()
  tabs.push(tab)
  await tab.store.start()
  await tab.store.create({ modules: { quickCheck: true }, name: "Twin" })
  const exported = (await tab.store.exportProject())!
  file = new File([exported.text], exported.fileName)
  return tab.store
}

describe("ImportProvider", () => {
  it.each(["en", "de"] as const)("asks on an id clash and keeps both by default (%s)", async (lang) => {
    const store = await storeWithProject()
    const { shell } = testDictionaries(lang)
    renderDashboard(
      <ImportProvider>
        <Picker />
      </ImportProvider>,
      { store, lang },
    )
    await userEvent.click(screen.getByRole("button", { name: "pick" }))
    expect(await screen.findByRole("alertdialog", { name: shell.importFlow.conflictTitle })).toHaveTextContent("Twin")
    await userEvent.click(screen.getByRole("button", { name: shell.importFlow.copy }))
    await waitFor(() => expect(store.getState().projects).toHaveLength(2))
    expect(push).toHaveBeenCalledWith(`/${lang}/dashboard/overview`)
  })

  it("replaces the stored project on request and does nothing on cancel", async () => {
    const store = await storeWithProject()
    renderDashboard(
      <ImportProvider>
        <Picker />
      </ImportProvider>,
      { store },
    )
    await userEvent.click(screen.getByRole("button", { name: "pick" }))
    await userEvent.click(await screen.findByRole("button", { name: "Cancel" }))
    expect(push).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole("button", { name: "pick" }))
    await userEvent.click(await screen.findByRole("button", { name: "Replace" }))
    await waitFor(() => expect(push).toHaveBeenCalledTimes(1))
    expect(store.getState().projects).toHaveLength(1)
  })

  it("lists bad fields of an invalid file by their labels", async () => {
    const store = await storeWithProject()
    const text = await file.text()
    file = new File([text.replace('"total": null', '"total": -4')], "bad.firstmove.json")
    renderDashboard(
      <ImportProvider>
        <Picker />
      </ImportProvider>,
      { store },
    )
    await userEvent.click(screen.getByRole("button", { name: "pick" }))
    const dialog = await screen.findByRole("alertdialog")
    expect(dialog).toHaveTextContent("Total number of buildings: Enter 1 or more.")
  })

  it("requires the provider", () => {
    expect(() => renderDashboard(<Picker />, { store: testTab().store })).toThrow("ImportProvider is missing")
  })
})
