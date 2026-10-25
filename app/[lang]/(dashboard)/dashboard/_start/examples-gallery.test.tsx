import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { exampleCards } from "@/lib/dashboard/example-cards"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { testDictionaries } from "../_components/test-utils/dictionaries"
import { renderDashboard } from "../_components/test-utils/render"
import { ExamplesGallery } from "./examples-gallery"

const push = vi.hoisted(() => vi.fn())
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

describe("ExamplesGallery (D-04)", () => {
  it("starts collapsed and opens on its button", async () => {
    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    const { start } = testDictionaries("en")
    renderDashboard(<ExamplesGallery examples={exampleCards("en")} />, { store: tab.store, lang: "en" })
    expect(screen.queryAllByRole("article")).toHaveLength(0)
    const toggle = screen.getByRole("button", { name: "Show 6 examples" })
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(toggle)
    expect(screen.getAllByRole("article")).toHaveLength(6)
    expect(screen.getByRole("button", { name: start.examples.hide })).toHaveAttribute("aria-expanded", "true")
  })

  it.each(["en", "de"] as const)("opens a copy of an example at the overview (%s)", async (lang) => {
    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    const cards = exampleCards(lang)
    const { start } = testDictionaries(lang)
    renderDashboard(<ExamplesGallery examples={cards} />, { store: tab.store, lang })
    await userEvent.click(screen.getByRole("button", { expanded: false }))
    expect(screen.getAllByRole("article")).toHaveLength(6)
    const card = screen.getByRole("article", { name: cards[4].name })
    await userEvent.click(within(card).getByRole("button", { name: new RegExp(start.examples.open) }))
    await waitFor(() => expect(push).toHaveBeenCalledWith(`/${lang}/dashboard/overview`))
    const active = tab.store.getState().active!
    expect(active.meta.exampleId).toBe(cards[4].id)
    expect(active.meta.id).not.toBe("00000000-0000-4000-8000-000000000000")
  })
})
