import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { pitchReadiness } from "@/lib/business-plan"
import { getExample, localizeExample } from "@/lib/examples"
import { testBrowser, testTab, until, type TestTab } from "@/lib/store/test-utils/harness"
import { renderDashboard } from "../../../_components/test-utils/render"
import { BusinessPlanStep } from "./business-plan-step"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/" }))
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() }, Toaster: () => null }))

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

/** One field in each step, with the step it is on. */
const EDITS = [
  { step: "opportunity", label: "Key pain point", text: "Rising gas prices and old boilers" },
  { step: "business-logic", label: "Revenue streams", text: "Connection fee, base price, energy price" },
  { step: "reality-check", label: "Financing", text: "Municipal loan plus a grant" },
  { step: "implementation", label: "Data to collect", text: "Load profiles of the three anchor buildings" },
] as const

describe("Business Plan, all four steps (PLAN-DASH-10 verification)", () => {
  it("Example 3, edited across all 4 steps, shows full completeness and survives a reload", async () => {
    const browser = testBrowser()
    const tab = testTab(browser)
    tabs.push(tab)
    await tab.store.start()
    await tab.store.addCopy(localizeExample(getExample("housing-cooperatives")!, "en"))
    expect(pitchReadiness(tab.store.getState().active!).score).toBe(1)

    for (const { step, label, text } of EDITS) {
      const { unmount } = renderDashboard(<BusinessPlanStep step={step} />, { store: tab.store })
      const input = screen.getByLabelText(label)
      await userEvent.clear(input)
      // emptying a field takes a point away from the pitch ...
      expect(pitchReadiness(tab.store.getState().active!).score, `${step}: cleared`).toBeLessThan(1)
      await userEvent.click(input)
      await userEvent.paste(text)
      // ... and writing it again gives the point back
      expect(pitchReadiness(tab.store.getState().active!).score, `${step}: retyped`).toBe(1)
      unmount()
    }

    const edited = tab.store.getState().active!
    expect(edited.businessPlan.opportunity.painPoint).toBe(EDITS[0].text)
    expect(edited.businessPlan.canvas.revenueStreams).toBe(EDITS[1].text)
    expect(edited.businessPlan.assumptions.financing).toBe(EDITS[2].text)
    expect(edited.businessPlan.nextSteps.data).toBe(EDITS[3].text)

    // the step shows the same full score
    const view = renderDashboard(<BusinessPlanStep step="implementation" />, { store: tab.store })
    expect(screen.getAllByText("100%").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Complete").length).toBeGreaterThan(0)
    view.unmount()

    // reload: a new store over the same browser storage, same tab
    await tab.store.flush()
    const reloaded = testTab(browser, { session: tab.session })
    tabs.push(reloaded)
    await reloaded.store.start()
    await until(reloaded, (state) => state.phase === "ready" && state.active !== null)
    const back = reloaded.store.getState().active!
    expect(back.businessPlan).toEqual(edited.businessPlan)
    expect(back.site).toEqual(edited.site)
    expect(pitchReadiness(back).score).toBe(1)
    renderDashboard(<BusinessPlanStep step="reality-check" />, { store: reloaded.store })
    expect(screen.getByLabelText("Financing")).toHaveValue(EDITS[2].text)
  }, 30_000)

  it("a project built from scratch across the four steps reaches full completeness", async () => {
    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    await tab.store.create({ modules: { businessPlan: true } })
    const filled = localizeExample(getExample("housing-cooperatives")!, "en").businessPlan
    // only the fields that count for completeness are needed
    expect(pitchReadiness(tab.store.getState().active!).level).toBe("not-started")
    tab.store.patch({
      "site.name": "Cooperative quarter",
      "site.stakeholders": ["Housing cooperatives"],
      ...Object.fromEntries(Object.entries(filled.opportunity).map(([key, value]) => [`businessPlan.opportunity.${key}`, value])),
      ...Object.fromEntries(Object.entries(filled.canvas).map(([key, value]) => [`businessPlan.canvas.${key}`, value])),
      ...Object.fromEntries(Object.entries(filled.assumptions).map(([key, value]) => [`businessPlan.assumptions.${key}`, value])),
      ...Object.fromEntries(Object.entries(filled.refinements).map(([key, value]) => [`businessPlan.refinements.${key}`, value])),
      ...Object.fromEntries(Object.entries(filled.scalability).map(([key, value]) => [`businessPlan.scalability.${key}`, value])),
      ...Object.fromEntries(Object.entries(filled.nextSteps).map(([key, value]) => [`businessPlan.nextSteps.${key}`, value])),
      "businessPlan.allocation": filled.allocation,
      "businessPlan.criticalAssumptions": filled.criticalAssumptions,
      "businessPlan.risks": filled.risks,
    })
    const readiness = pitchReadiness(tab.store.getState().active!)
    expect(readiness.score).toBe(1)
    expect(readiness.level).toBe("ready")
  })
})
