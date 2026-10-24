import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import en from "@/dictionaries/en/legal.json"

describe("AiProviders", () => {
  it("says no provider is connected yet while the list is empty", async () => {
    const { AiProviders } = await import("./ai-providers")
    render(<AiProviders copy={en.aiProviders} />)
    expect(screen.getByText(en.aiProviders.none)).toBeInTheDocument()
  })

  it("lists providers with their region once there are any", async () => {
    vi.resetModules()
    vi.doMock("@/lib/legal/ai", () => ({
      AI_PROVIDERS: [{ name: "Example AI", region: "EU", url: "https://example.org" }],
    }))
    const { AiProviders } = await import("./ai-providers")
    render(<AiProviders copy={en.aiProviders} />)
    expect(screen.getByRole("link", { name: "Example AI" })).toHaveAttribute("href", "https://example.org")
    expect(screen.getByRole("list", { name: en.aiProviders.label })).toHaveTextContent("EU")
    vi.doUnmock("@/lib/legal/ai")
  })
})
