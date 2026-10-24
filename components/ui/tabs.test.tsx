import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"

describe("Tabs", () => {
  it("switches panels and marks the active tab", async () => {
    render(
      <Tabs defaultValue="a">
        <TabsList variant="hot">
          <TabsTrigger value="a">First</TabsTrigger>
          <TabsTrigger value="b">Second</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
      </Tabs>,
    )
    expect(screen.getByText("Panel A")).toBeVisible()
    await userEvent.click(screen.getByRole("tab", { name: "Second" }))
    expect(screen.getByRole("tab", { name: "Second" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByText("Panel B")).toBeVisible()
    expect(screen.getByRole("tablist")).toHaveAttribute("data-variant", "hot")
  })
})
