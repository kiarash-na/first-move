import { screen } from "@testing-library/react"
import type { ComponentProps } from "react"
import { describe, expect, it, vi } from "vitest"
import common from "@/dictionaries/en/common.json"
import shell from "@/dictionaries/en/shell.json"
import { renderDashboard } from "../test-utils/render"
import { fakeStore } from "../test-utils/fake-store"
import { SidebarContent } from "./sidebar-content"

vi.mock("next/navigation", () => ({ usePathname: () => "/en/dashboard" }))
// Records the prefetch prop, which the real Link does not put in the DOM.
vi.mock("next/link", () => ({
  default: ({ prefetch, ...props }: ComponentProps<"a"> & { prefetch?: boolean | null }) => (
    <a data-prefetch={String(prefetch)} {...props} />
  ),
}))

describe("SidebarContent", () => {
  it("holds brand, open project, navigation, footer and the privacy note", () => {
    renderDashboard(<SidebarContent footer={<p>Footer slot</p>} />, { store: fakeStore().store })
    expect(screen.getByRole("link", { name: common.app.homeLabel })).toHaveAttribute("href", "/en")
    expect(screen.getByText(shell.nav.currentProject)).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: shell.nav.label })).toBeInTheDocument()
    expect(screen.getByText("Footer slot")).toBeInTheDocument()
    expect(screen.getByText(shell.nav.privacy)).toBeInTheDocument()
  })

  it("does not prefetch the landing page, whose stylesheet the dashboard never uses", () => {
    renderDashboard(<SidebarContent />, { store: fakeStore().store })
    expect(screen.getByRole("link", { name: common.app.homeLabel })).toHaveAttribute("data-prefetch", "false")
  })
})
