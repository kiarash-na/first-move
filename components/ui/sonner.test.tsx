import { act, render, screen } from "@testing-library/react"
import { toast } from "sonner"
import { describe, expect, it } from "vitest"
import { Toaster } from "./sonner"

describe("Toaster", () => {
  it("shows toasts in the current theme", async () => {
    document.documentElement.setAttribute("data-theme", "light")
    render(<Toaster />)
    act(() => {
      toast("Saved")
    })
    expect(await screen.findByText("Saved")).toBeInTheDocument()
    expect(document.querySelector("[data-sonner-toaster]")).toHaveAttribute("data-sonner-theme", "light")
    document.documentElement.setAttribute("data-theme", "dark")
  })

  it("keeps its flat toast style when toast options are passed", async () => {
    render(<Toaster toastOptions={{ closeButtonAriaLabel: "Dismiss", classNames: { toast: "extra" } }} closeButton />)
    act(() => {
      toast("Merged")
    })
    const item = (await screen.findByText("Merged")).closest("li")!
    expect(item.className).toContain("shadow-none!")
    expect(item.className).toContain("extra")
    expect(item.querySelector('button[aria-label="Dismiss"]')).not.toBeNull()
  })
})
