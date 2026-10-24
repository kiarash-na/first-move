import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactElement } from "react"
import { describe, expect, it } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { inRail, testRail } from "../test-utils/rail"
import { RailTooltip } from "./rail-tooltip"

function renderTooltip(ui: ReactElement) {
  return render(<TooltipProvider delayDuration={0}>{ui}</TooltipProvider>)
}

const link = (
  <a href="#buildings">
    <span className="sr-only">Buildings</span>
  </a>
)

describe("RailTooltip (D-59)", () => {
  it("leaves its child alone outside the desktop sidebar, as in the mobile sheet", async () => {
    const { container } = renderTooltip(<RailTooltip label="Quick Check · Buildings">{link}</RailTooltip>)
    const anchor = screen.getByRole("link", { name: "Buildings" })
    expect(anchor).not.toHaveAttribute("data-state")
    await act(async () => anchor.focus())
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
    expect(container.innerHTML).toBe('<a href="#buildings"><span class="sr-only">Buildings</span></a>')
  })

  it("names the entry on keyboard focus while the rail is collapsed", async () => {
    renderTooltip(inRail(<RailTooltip label="Quick Check · Buildings">{link}</RailTooltip>, testRail(true)))
    await act(async () => screen.getByRole("link", { name: "Buildings" }).focus())
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Quick Check · Buildings")
  })

  it("names the entry on hover while the rail is collapsed", async () => {
    renderTooltip(inRail(<RailTooltip label="Quick Check · Buildings">{link}</RailTooltip>, testRail(true)))
    await userEvent.hover(screen.getByRole("link", { name: "Buildings" }))
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Quick Check · Buildings")
  })

  it("stays closed while the sidebar is expanded, does not pop up when it collapses, and works once collapsed", async () => {
    const tooltip = (collapsed: boolean) => (
      <TooltipProvider delayDuration={0}>{inRail(<RailTooltip label="Quick Check · Buildings">{link}</RailTooltip>, testRail(collapsed))}</TooltipProvider>
    )
    const { rerender } = render(tooltip(false))
    const anchor = screen.getByRole("link", { name: "Buildings" })
    await userEvent.hover(anchor)
    await act(async () => anchor.focus())
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
    expect(anchor).toHaveAttribute("data-state", "closed")

    rerender(tooltip(true))
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
    await act(async () => anchor.blur())
    await act(async () => anchor.focus())
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Quick Check · Buildings")
  })

  it("closes on click, so a pressed rail control never keeps its tooltip", async () => {
    renderTooltip(
      inRail(
        <RailTooltip always label="Collapse sidebar">
          <button type="button" aria-label="Collapse sidebar" />
        </RailTooltip>,
        testRail(false),
      ),
    )
    const button = screen.getByRole("button", { name: "Collapse sidebar" })
    await userEvent.hover(button)
    expect(await screen.findByRole("tooltip")).toBeInTheDocument()
    await userEvent.click(button)
    expect(button).toHaveAttribute("data-state", "closed")
  })

  it("shows in both states with `always`, for a control that is an icon in both", async () => {
    renderTooltip(
      inRail(
        <RailTooltip always label="Collapse sidebar">
          <button type="button" aria-label="Collapse sidebar" />
        </RailTooltip>,
        testRail(false),
      ),
    )
    await act(async () => screen.getByRole("button", { name: "Collapse sidebar" }).focus())
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Collapse sidebar")
  })
})
