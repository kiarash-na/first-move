import { act, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import shell from "@/dictionaries/en/shell.json"
import { fakeStore } from "../test-utils/fake-store"
import { inRail, testRail } from "../test-utils/rail"
import { renderDashboard } from "../test-utils/render"
import { SidebarPrivacy } from "./sidebar-privacy"

describe("SidebarPrivacy", () => {
  it("shows the note with its shield, and nothing else, outside the desktop sidebar (mobile sheet)", () => {
    renderDashboard(<SidebarPrivacy />, { store: fakeStore().store })
    const note = screen.getByText(shell.nav.privacy)
    expect(note.querySelector("svg")).not.toBeNull()
    expect(note).not.toHaveAttribute("tabindex")
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("in the collapsed rail is a shield button with the note in its tooltip, the note kept for screen readers (D-59)", async () => {
    renderDashboard(inRail(<SidebarPrivacy />, testRail(true)), { store: fakeStore().store })
    expect(screen.getByText(shell.nav.privacy)).toHaveClass("rail:sr-only")
    const button = screen.getByRole("button", { name: shell.nav.rail.privacy })
    await act(async () => button.focus())
    expect(await screen.findByRole("tooltip")).toHaveTextContent(shell.nav.privacy)
  })

  it("expands the sidebar and moves focus to the note", async () => {
    const rail = testRail(true)
    renderDashboard(inRail(<SidebarPrivacy />, rail), { store: fakeStore().store })
    await userEvent.click(screen.getByRole("button", { name: shell.nav.rail.privacy }))
    expect(rail.setCollapsed).toHaveBeenCalledWith(false)
    expect(screen.getByText(shell.nav.privacy, { selector: "p" })).toHaveFocus()
  })
})
