import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { ImportProvider } from "../import/import-provider"
import { testDictionaries } from "../test-utils/dictionaries"
import { renderDashboard } from "../test-utils/render"
import { ImportButton } from "./import-button"

const push = vi.hoisted(() => vi.fn())
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

describe("ImportButton", () => {
  it.each(["en", "de"] as const)("shows why a picked file was rejected (%s)", async (lang) => {
    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    const { shell } = testDictionaries(lang)
    renderDashboard(
      <ImportProvider>
        <ImportButton />
      </ImportProvider>,
      { store: tab.store, lang },
    )
    expect(screen.getByRole("button", { name: shell.topBar.import })).toBeInTheDocument()
    await userEvent.upload(screen.getByLabelText(shell.importFlow.choose), new File(["{nope"], "x.firstmove.json"))
    expect(await screen.findByRole("alertdialog", { name: shell.importFlow.failedTitle })).toHaveTextContent(
      shell.storage.import.error["not-json"],
    )
    expect(push).not.toHaveBeenCalled()
  })

  it("imports a valid file and opens its overview", async () => {
    const source = testTab()
    tabs.push(source)
    await source.store.start()
    await source.store.create({ modules: { quickCheck: true }, name: "From a file" })
    const file = (await source.store.exportProject())!

    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    renderDashboard(
      <ImportProvider>
        <ImportButton />
      </ImportProvider>,
      { store: tab.store },
    )
    await userEvent.upload(screen.getByLabelText("Choose a .firstmove.json file"), new File([file.text], file.fileName))
    await waitFor(() => expect(push).toHaveBeenCalledWith("/en/dashboard/overview"))
    expect(tab.store.getState().active?.meta.name).toBe("From a file")
  })
})
