import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { KEYS } from "@/lib/assistant/keys/registry"
import { ASSISTANT_MODELS, DEFAULT_MODEL } from "@/lib/assistant/providers/models"
import { forgetKey, rememberKey } from "@/lib/assistant/vault/vault"
import { interpolate } from "@/lib/i18n/interpolate"
import { assistantCopy, renderAgent } from "../test-utils/render"
import { AssistantPanel } from "./assistant-panel"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/en/dashboard" }))

const copy = assistantCopy()
const GATEWAY_KEY = "vck_test_key_from_plan_score_00001234"
const gatewayModel = ASSISTANT_MODELS.gateway.find((model) => model.id === DEFAULT_MODEL.gateway)!

afterEach(async () => {
  vi.unstubAllGlobals()
  KEYS.gateway.clear()
  KEYS.openrouter.clear()
  await forgetKey("gateway")
})

describe("AssistantPanel", () => {
  it("is a labelled, non-modal side sheet that starts with the key setup when no key is in use", async () => {
    const onClose = vi.fn()
    renderAgent(<AssistantPanel open onClose={onClose} />)
    const panel = screen.getByRole("dialog", { name: copy.panel.title })
    expect(panel).toHaveAttribute("aria-modal", "false")
    expect(panel.className).toMatch(/md:w-\[clamp/)
    expect(panel).toHaveTextContent(copy.panel.badge)
    expect(screen.getByRole("heading", { name: copy.setup.title })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: copy.panel.settings })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: copy.panel.close }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it("is modal on a phone, where it covers the page: Tab and Shift+Tab stay inside", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }))
    renderAgent(<AssistantPanel open onClose={vi.fn()} />)
    const panel = screen.getByRole("dialog", { name: copy.panel.title })
    expect(panel).toHaveAttribute("aria-modal", "true")
    await waitFor(() => expect(panel).toHaveFocus())
    const close = screen.getByRole("button", { name: copy.panel.close })
    // "Check and use key" is disabled until the notice is confirmed, so the box is the last stop.
    const last = screen.getByRole("checkbox", { name: copy.notice.ack })
    await userEvent.tab({ shift: true })
    expect(last).toHaveFocus()
    await userEvent.tab()
    expect(close).toHaveFocus()
    await userEvent.tab({ shift: true })
    expect(last).toHaveFocus()
  })

  it("is hidden while closed", () => {
    renderAgent(<AssistantPanel open={false} onClose={vi.fn()} />)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(document.querySelector("[data-slot='assistant-panel']")).toHaveAttribute("hidden")
  })

  it("uses a Gateway key already in memory, the one the AI Plan Score set, and goes straight to the chat", async () => {
    KEYS.gateway.set(GATEWAY_KEY)
    renderAgent(<AssistantPanel open onClose={vi.fn()} />)
    expect(screen.getByText(interpolate(copy.chat.via, { model: gatewayModel.name, provider: copy.providers.gateway }))).toBeInTheDocument()
    await waitFor(() => expect(screen.getByLabelText(copy.chat.label)).toHaveFocus())

    await userEvent.click(screen.getByRole("button", { name: copy.panel.settings }))
    expect(screen.getByText(interpolate(copy.setup.active, { masked: KEYS.gateway.masked()!, provider: copy.providers.gateway }))).toBeInTheDocument()
    expect(screen.getByLabelText(copy.setup.model.label)).toHaveValue(DEFAULT_MODEL.gateway)
    await userEvent.click(screen.getByRole("button", { name: copy.panel.back }))
    expect(screen.getByLabelText(copy.chat.label)).toBeInTheDocument()

    // Forgetting the key in this tab returns to the setup.
    await userEvent.click(screen.getByRole("button", { name: copy.panel.settings }))
    await userEvent.click(screen.getByRole("button", { name: copy.setup.forget }))
    expect(KEYS.gateway.read()).toBeNull()
    expect(screen.getByRole("heading", { name: copy.setup.title })).toBeInTheDocument()
  })

  it("offers to unlock a remembered key, or to paste another one", async () => {
    await rememberKey("gateway", GATEWAY_KEY, "482915", { iterations: 1000 })
    renderAgent(<AssistantPanel open onClose={vi.fn()} />)
    expect(await screen.findByRole("heading", { name: copy.unlock.title })).toBeInTheDocument()
    expect(screen.getByText(interpolate(copy.unlock.lead, { provider: copy.providers.gateway, last4: "1234" }))).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: copy.unlock.other }))
    expect(screen.getByRole("heading", { name: copy.setup.title })).toBeInTheDocument()
  })

  it("after a new key, shows what the provider said about it, then the chat", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ data: { limit: 5, limit_remaining: 5, usage: 0 } }), { headers: { "content-type": "application/json" } })))
    renderAgent(<AssistantPanel open onClose={vi.fn()} />)
    await userEvent.click(screen.getByRole("radio", { name: new RegExp(copy.providers.openrouter) }))
    await userEvent.type(screen.getByLabelText(copy.setup.key.label), `sk-or-v1-${"ab".repeat(32)}`)
    await userEvent.click(screen.getByRole("checkbox", { name: copy.notice.ack }))
    await userEvent.click(screen.getByRole("button", { name: copy.setup.use }))
    expect(await screen.findByText(copy.setup.noExpiry)).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: copy.panel.back }))
    expect(screen.getByText(interpolate(copy.chat.via, { model: ASSISTANT_MODELS.openrouter.find((model) => model.id === DEFAULT_MODEL.openrouter)!.name, provider: copy.providers.openrouter }))).toBeInTheDocument()
  })
})
