import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { KEYS } from "@/lib/assistant/keys/registry"
import { AgentLauncher } from "./agent-launcher"
import { assistantCopy, renderAgent } from "./test-utils/render"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/en/dashboard" }))

afterEach(() => {
  vi.doUnmock("./panel/assistant-panel")
  KEYS.gateway.clear()
  KEYS.openrouter.clear()
})

const copy = assistantCopy()

describe("AgentLauncher", () => {
  it("is a 48px square Bot button, bottom right, and loads no panel before the first click", () => {
    renderAgent(<AgentLauncher />)
    const button = screen.getByRole("button", { name: copy.launcher.open })
    expect(button).toHaveClass("fixed", "size-12", "z-40")
    expect(button.className).toMatch(/right-/)
    expect(button).toHaveAttribute("aria-expanded", "false")
    expect(button.querySelector("svg")).toHaveClass("lucide-bot")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("opens the panel on click, closes it with Esc and returns focus to the button", async () => {
    renderAgent(<AgentLauncher />)
    const button = screen.getByRole("button", { name: copy.launcher.open })
    await userEvent.click(button)
    const panel = await screen.findByRole("dialog", { name: copy.panel.title }, { timeout: 10_000 })
    expect(button).toHaveAttribute("aria-expanded", "true")
    expect(button).toHaveAccessibleName(copy.launcher.close)
    await waitFor(() => expect(panel).toHaveFocus())
    // The open panel covers the button, so Tab skips it meanwhile.
    expect(button).toHaveAttribute("tabindex", "-1")
    await userEvent.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(button).toHaveFocus()
    expect(button).toHaveAttribute("aria-expanded", "false")
    expect(button).not.toHaveAttribute("tabindex")
  })

  it("says the assistant is loading until the panel is there", async () => {
    let release = () => {}
    const gate = new Promise<void>((resolve) => (release = resolve))
    vi.doMock("./panel/assistant-panel", async (original) => {
      await gate
      return original()
    })
    renderAgent(<AgentLauncher />)
    const button = screen.getByRole("button", { name: copy.launcher.open })
    await userEvent.click(button)
    expect(screen.getByRole("status")).toHaveTextContent(copy.panel.loading)
    expect(button).toHaveAttribute("aria-expanded", "true")
    release()
    await screen.findByRole("dialog", { name: copy.panel.title }, { timeout: 10_000 })
    expect(screen.queryByText(copy.panel.loading)).not.toBeInTheDocument()
  })

  it("says so in place when the panel cannot load, and tries again on the next click", async () => {
    vi.doMock("./panel/assistant-panel", () => {
      throw new Error("Failed to fetch dynamically imported module")
    })
    renderAgent(<AgentLauncher />)
    const button = screen.getByRole("button", { name: copy.launcher.open })
    await userEvent.click(button)
    expect(await screen.findByRole("alert")).toHaveTextContent(copy.panel.loadFailed)
    expect(button).toHaveAttribute("aria-expanded", "false")
    expect(button).toHaveAccessibleName(copy.launcher.open)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    vi.doUnmock("./panel/assistant-panel")
    await userEvent.click(button)
    expect(await screen.findByRole("dialog", { name: copy.panel.title }, { timeout: 10_000 })).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("keeps the panel mounted while closed, and closes it with its own button", async () => {
    renderAgent(<AgentLauncher />)
    const button = screen.getByRole("button", { name: copy.launcher.open })
    await userEvent.click(button)
    await screen.findByRole("dialog", {}, { timeout: 10_000 })
    await userEvent.click(screen.getByRole("button", { name: copy.panel.close }))
    expect(document.querySelector("[data-slot='assistant-panel']")).toHaveAttribute("hidden")
    expect(button).toHaveFocus()
    await userEvent.click(button)
    expect(screen.getByRole("dialog")).toBeVisible()
  })
})
