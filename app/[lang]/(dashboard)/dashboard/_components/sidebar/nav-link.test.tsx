import { act, render, screen } from "@testing-library/react"
import { Building2Icon, LayoutDashboardIcon } from "lucide-react"
import { describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { inRail, testRail } from "../test-utils/rail"
import { NavLink } from "./nav-link"

vi.mock("next/navigation", () => ({ usePathname: () => "/en/dashboard/quick-check/area" }))

const buildings = (
  <NavLink href="/en/dashboard/quick-check/buildings" label="Buildings" tooltip="Quick Check · Buildings" tone="cool" step={2} icon={Building2Icon} />
)

describe("NavLink", () => {
  it("marks the current page and shows the step number", () => {
    render(<NavLink href="/en/dashboard/quick-check/area" label="Project area" tone="cool" step={1} />)
    const link = screen.getByRole("link", { name: "Project area" })
    expect(link).toHaveAttribute("aria-current", "page")
    expect(link).toHaveTextContent("01")
    expect(link.querySelector(".bg-primary")).not.toBeNull()
  })

  it("leaves other pages unmarked and shows the icon", () => {
    render(<NavLink href="/en/dashboard/overview" label="Overview" icon={LayoutDashboardIcon} />)
    const link = screen.getByRole("link", { name: "Overview" })
    expect(link).not.toHaveAttribute("aria-current")
    expect(link.querySelector("svg")).not.toBeNull()
  })

  it("renders a numbered step without its icon or tooltip outside the desktop sidebar (mobile sheet)", () => {
    render(buildings)
    const link = screen.getByRole("link", { name: "Buildings" })
    expect(link.querySelector("svg")).toBeNull()
    expect(link).not.toHaveAttribute("data-state")
  })

  it("in the rail: the icon replaces the number, the label stays for screen readers, the module colour stays (D-59)", () => {
    render(<TooltipProvider>{inRail(buildings, testRail(true))}</TooltipProvider>)
    const link = screen.getByRole("link", { name: "Buildings" })
    const [number, label] = [link.querySelector("span.font-mono"), link.querySelector("span.truncate")]
    expect(number).toHaveClass("rail:hidden")
    expect(label).toHaveTextContent("Buildings")
    expect(label).toHaveClass("rail:sr-only")
    expect(link.querySelector("svg")).toHaveClass("hidden", "rail:block", "rail:text-primary")
    expect(link).toHaveClass("rail:justify-center")
  })

  it("in the collapsed rail it names its section and page in a tooltip on focus (D-59)", async () => {
    render(<TooltipProvider delayDuration={0}>{inRail(buildings, testRail(true))}</TooltipProvider>)
    await act(async () => screen.getByRole("link", { name: "Buildings" }).focus())
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Quick Check · Buildings")
  })

  it("keeps the orange of the Business Plan in the rail", () => {
    render(
      <TooltipProvider>
        {inRail(<NavLink href="/en/dashboard/business-plan/opportunity" label="Opportunity" tone="hot" step={1} icon={LayoutDashboardIcon} />)}
      </TooltipProvider>,
    )
    expect(screen.getByRole("link", { name: "Opportunity" }).querySelector("svg")).toHaveClass("rail:text-hot")
  })
})
