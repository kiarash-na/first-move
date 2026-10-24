import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import common from "@/dictionaries/en/common.json"
import start from "@/dictionaries/en/start.json"
import { StartPlaceholder } from "./start-placeholder"

vi.mock("next/navigation", () => ({ usePathname: () => "/en/dashboard" }))

describe("StartPlaceholder", () => {
  it("renders the dictionary copy and links back to the website", () => {
    render(<StartPlaceholder lang="en" common={common} copy={start.placeholder} />)
    expect(screen.getByRole("heading", { level: 1, name: start.placeholder.title })).toBeInTheDocument()
    expect(screen.getByText(start.placeholder.status)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: start.placeholder.website })).toHaveAttribute("href", "/en")
    expect(screen.getByRole("button", { name: common.theme.switchToLight })).toBeInTheDocument()
  })
})
