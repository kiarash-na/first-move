import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import en from "@/dictionaries/en/common.json"
import DashboardNotFound from "./not-found"

const root = vi.hoisted(() => ({ lang: "de" as string | undefined }))
vi.mock("next/root-params", () => ({ lang: async () => root.lang }))

describe("dashboard not-found", () => {
  it("links back to the dashboard in the page language", async () => {
    root.lang = "de"
    render(await DashboardNotFound())
    expect(screen.getByRole("link")).toHaveAttribute("href", "/de/dashboard")
  })

  it("falls back to the default locale for an unknown language", async () => {
    root.lang = "xx"
    render(await DashboardNotFound())
    expect(screen.getByRole("link", { name: en.notFound.home })).toHaveAttribute("href", "/en/dashboard")
  })
})
