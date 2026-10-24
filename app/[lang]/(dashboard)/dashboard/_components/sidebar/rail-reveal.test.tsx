import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ShieldCheckIcon } from "lucide-react"
import { useRef } from "react"
import { describe, expect, it } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { inRail, testRail } from "../test-utils/rail"
import { RailReveal } from "./rail-reveal"

function Part({ loading = false }: { loading?: boolean }) {
  const note = useRef<HTMLParagraphElement>(null)
  return (
    <>
      <p ref={note} tabIndex={-1}>
        Your data stays in this browser.
      </p>
      <RailReveal icon={ShieldCheckIcon} label="About your data" tooltip="Your data stays in this browser." target={note} loading={loading} />
    </>
  )
}

describe("RailReveal (D-59)", () => {
  it("renders nothing outside the desktop sidebar", () => {
    render(<Part />)
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("is shown by CSS only while collapsed, and controls the sidebar", () => {
    const rail = testRail(true)
    render(<TooltipProvider>{inRail(<Part />, rail)}</TooltipProvider>)
    const button = screen.getByRole("button", { name: "About your data" })
    expect(button.parentElement).toHaveClass("hidden", "rail:flex")
    expect(button).toHaveAttribute("aria-expanded", "false")
    expect(button).toHaveAttribute("aria-controls", rail.id)
  })

  it("shows the hidden text in its tooltip on focus", async () => {
    render(<TooltipProvider>{inRail(<Part />)}</TooltipProvider>)
    await act(async () => screen.getByRole("button", { name: "About your data" }).focus())
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Your data stays in this browser.")
  })

  it("expands the sidebar and moves focus to the part it stands for", async () => {
    const rail = testRail(true)
    render(<TooltipProvider>{inRail(<Part />, rail)}</TooltipProvider>)
    await userEvent.click(screen.getByRole("button", { name: "About your data" }))
    expect(rail.setCollapsed).toHaveBeenCalledWith(false)
    expect(screen.getByText("Your data stays in this browser.", { selector: "p" })).toHaveFocus()
  })

  it("shows a skeleton while the part is loading", () => {
    render(<TooltipProvider>{inRail(<Part loading />)}</TooltipProvider>)
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
    expect(document.querySelector("[data-slot=rail-reveal] [data-slot=skeleton]")).not.toBeNull()
  })
})
