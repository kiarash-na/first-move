import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { REFERENCE_CASE_CATALOG } from "@/lib/examples/reference-cases/catalog"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { testDictionaries } from "../_components/test-utils/dictionaries"
import { renderDashboard } from "../_components/test-utils/render"
import { ReferenceCasesGallery } from "./reference-cases-gallery"

const push = vi.hoisted(() => vi.fn())
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

async function startedTab() {
  const tab = testTab()
  tabs.push(tab)
  await tab.store.start()
  return tab
}

describe("ReferenceCasesGallery (D-76)", () => {
  it.each([
    ["en", "Show 6 reference cases"],
    ["de", "6 Referenzfälle anzeigen"],
  ] as const)("starts collapsed and opens on the button in its heading (%s)", async (lang, show) => {
    const tab = await startedTab()
    const copy = testDictionaries(lang).start.referenceCases
    renderDashboard(<ReferenceCasesGallery />, { store: tab.store, lang })
    expect(screen.getByRole("heading", { name: copy.title })).toBeInTheDocument()
    expect(screen.queryAllByRole("article")).toHaveLength(0)
    const toggle = screen.getByRole("button", { name: show })
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(toggle)
    expect(screen.getAllByRole("article").map((card) => card.getAttribute("data-reference-case"))).toEqual(
      REFERENCE_CASE_CATALOG.map((card) => card.id),
    )
    expect(screen.getByRole("button", { name: copy.hide })).toHaveAttribute("aria-expanded", "true")
  })

  it("shows the disclaimer on the three fictional cards only", async () => {
    const tab = await startedTab()
    const copy = testDictionaries("en").start.referenceCases
    renderDashboard(<ReferenceCasesGallery />, { store: tab.store, lang: "en" })
    await userEvent.click(screen.getByRole("button", { expanded: false }))
    for (const card of screen.getAllByRole("article")) {
      const fictional = card.getAttribute("data-kind") === "fictional"
      expect(within(card).queryByText(copy.disclaimer) !== null, card.getAttribute("data-reference-case")!).toBe(fictional)
    }
  })

  it.each(["en", "de"] as const)("opens a copy of a case at the overview, marked as an example (%s)", async (lang) => {
    const tab = await startedTab()
    const copy = testDictionaries(lang).start.referenceCases
    const target = REFERENCE_CASE_CATALOG[3]
    renderDashboard(<ReferenceCasesGallery />, { store: tab.store, lang })
    await userEvent.click(screen.getByRole("button", { expanded: false }))
    const card = screen.getByRole("article", { name: target.name[lang] })
    await userEvent.click(within(card).getByRole("button", { name: copy.open }))
    await waitFor(() => expect(push).toHaveBeenCalledWith(`/${lang}/dashboard/overview`))
    const active = tab.store.getState().active!
    expect(active.meta.exampleId).toBe(target.id)
    expect(active.meta.name).toBe(target.name[lang])
    expect(active.meta.id).not.toBe("00000000-0000-4000-8000-000000000000")
  })
})
