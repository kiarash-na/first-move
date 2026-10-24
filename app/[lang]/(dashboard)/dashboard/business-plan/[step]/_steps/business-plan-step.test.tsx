import { screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { BUSINESS_PLAN_PAGES } from "@/lib/dashboard/routes"
import { renderDashboard } from "../../../_components/test-utils/render"
import { openProject, stopTabs } from "../../_components/test-utils/open-project"
import { BusinessPlanStep } from "./business-plan-step"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/" }))
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() }, Toaster: () => null }))

afterEach(stopTabs)

const CONTENT = {
  opportunity: "Start from a use case",
  "business-logic": "Business Model Canvas",
  "reality-check": "Rough assumptions",
  implementation: "Pitch readiness",
} as const

describe("BusinessPlanStep", () => {
  it.each(BUSINESS_PLAN_PAGES)("renders %s inside the frame with its own panels", async (step) => {
    const tab = await openProject({ example: "housing-cooperatives" })
    renderDashboard(<BusinessPlanStep step={step} />, { store: tab.store })
    expect(screen.getByRole("navigation", { name: "Business Plan steps" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: CONTENT[step] })).toBeInTheDocument()
    expect(document.querySelector(`[data-step="${step}"]`)).not.toBeNull()
  })
})
