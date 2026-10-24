import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import common from "@/dictionaries/en/common.json"
import { ComingSoon } from "./coming-soon"

describe("ComingSoon", () => {
  it("renders the docs placeholder and links to the dashboard", () => {
    render(<ComingSoon lang="de" copy={common.docs} />)
    expect(screen.getByRole("heading", { level: 1, name: common.docs.title })).toBeInTheDocument()
    expect(screen.getByText(common.docs.status)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: common.docs.dashboard })).toHaveAttribute("href", "/de/dashboard")
  })
})
