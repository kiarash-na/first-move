import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"

describe("Tooltip", () => {
  it("shows its content when open", () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>Report</TooltipTrigger>
          <TooltipContent>Coming soon</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    expect(screen.getByRole("tooltip")).toHaveTextContent("Coming soon")
  })
})
