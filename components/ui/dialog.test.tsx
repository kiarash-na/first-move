import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog"

function Example({ closeLabel }: { closeLabel?: string }) {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent closeLabel={closeLabel}>
        <DialogHeader>
          <DialogTitle>Name your project</DialogTitle>
          <DialogDescription>Shown in the project list.</DialogDescription>
        </DialogHeader>
        <DialogFooter closeLabel={closeLabel ? "Cancel" : undefined} />
      </DialogContent>
    </Dialog>
  )
}

describe("Dialog", () => {
  it("opens and closes with the labelled close button", async () => {
    render(<Example closeLabel="Close" />)
    await userEvent.click(screen.getByRole("button", { name: "Open" }))
    expect(screen.getByRole("dialog", { name: "Name your project" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Close" }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("renders no close buttons without a label (no hard-coded copy)", async () => {
    render(<Example />)
    await userEvent.click(screen.getByRole("button", { name: "Open" }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /close|cancel/i })).not.toBeInTheDocument()
  })
})
