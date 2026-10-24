import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import assumptions from "@/dictionaries/en/assumptions.json"
import { renderDashboard } from "../../_components/test-utils/render"
import { emptyProject, projectStore } from "../../_components/test-utils/project-store"
import { PlaygroundBar } from "./playground-bar"

describe("PlaygroundBar (D-10)", () => {
  it("toggles, counts the custom values and resets", async () => {
    const onToggle = vi.fn()
    const onReset = vi.fn()
    renderDashboard(<PlaygroundBar playing customCount={2} onToggle={onToggle} onReset={onReset} />, { store: projectStore(emptyProject()).store })
    expect(screen.getByText("2 custom values in use")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("switch", { name: assumptions.playground.toggle }))
    expect(onToggle).toHaveBeenCalledWith(false)
    await userEvent.click(screen.getByRole("button", { name: assumptions.playground.reset }))
    expect(onReset).toHaveBeenCalledOnce()
  })
})
