import { fireEvent, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { ImportProvider } from "../_components/import/import-provider"
import { testDictionaries } from "../_components/test-utils/dictionaries"
import { renderDashboard } from "../_components/test-utils/render"
import { ImportDropZone } from "./import-drop-zone"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

describe("ImportDropZone", () => {
  it.each(["en", "de"] as const)("highlights on drag and shows import errors for a dropped file (%s)", async (lang) => {
    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    const { start, shell } = testDictionaries(lang)
    renderDashboard(
      <ImportProvider>
        <ImportDropZone />
      </ImportProvider>,
      { store: tab.store, lang },
    )
    const zone = screen.getByRole("region", { name: start.import.title })
    fireEvent.dragOver(zone, { dataTransfer: { dropEffect: "none", files: [] } })
    expect(zone).toHaveAttribute("data-over", "true")
    expect(screen.getByRole("heading", { name: start.import.drop })).toBeInTheDocument()
    const file = new File(["[]"], "list.json", { type: "application/json" })
    fireEvent.drop(zone, { dataTransfer: { files: [file] } })
    expect(await screen.findByRole("alertdialog", { name: shell.importFlow.failedTitle })).toHaveTextContent(
      shell.storage.import.error["not-first-move"],
    )
    expect(zone).not.toHaveAttribute("data-over")
  })
})
