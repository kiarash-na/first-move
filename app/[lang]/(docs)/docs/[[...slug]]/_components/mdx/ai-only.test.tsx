import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AiOnly } from "./ai-only"

describe("AiOnly", () => {
  it("shows its content while the AI features are live", () => {
    render(<AiOnly live>See the AI assistant.</AiOnly>)
    expect(screen.getByText("See the AI assistant.")).toBeInTheDocument()
  })

  it("renders nothing while they are off", () => {
    const { container } = render(<AiOnly live={false}>See the AI assistant.</AiOnly>)
    expect(container).toBeEmptyDOMElement()
  })
})
