import { render, screen } from "@testing-library/react"
import { LayoutDashboardIcon } from "lucide-react"
import { describe, expect, it, vi } from "vitest"
import { NavLink } from "./nav-link"

vi.mock("next/navigation", () => ({ usePathname: () => "/en/dashboard/quick-check/area" }))

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
})
