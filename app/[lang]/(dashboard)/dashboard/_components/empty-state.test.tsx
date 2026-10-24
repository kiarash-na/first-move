import { render, screen } from "@testing-library/react"
import { FolderOpenIcon } from "lucide-react"
import { describe, expect, it } from "vitest"
import { EmptyState } from "./empty-state"

describe("EmptyState", () => {
  it("renders the title, text and action", () => {
    render(<EmptyState icon={FolderOpenIcon} title="Nothing open" body="Open a project." action={<button type="button">Start</button>} tone="cool" />)
    expect(screen.getByRole("heading", { level: 2, name: "Nothing open" })).toBeInTheDocument()
    expect(screen.getByText("Open a project.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument()
  })
})
