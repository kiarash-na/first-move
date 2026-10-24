import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog"

describe("AlertDialog", () => {
  it("asks for confirmation and runs the action", async () => {
    const onDelete = vi.fn()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>!</AlertDialogMedia>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onDelete}>
              Delete now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Delete" }))
    expect(screen.getByRole("alertdialog", { name: "Delete project?" })).toBeInTheDocument()
    const action = screen.getByRole("button", { name: "Delete now" })
    expect(action.className).toContain("bg-destructive")
    await userEvent.click(action)
    expect(onDelete).toHaveBeenCalledOnce()
  })
})
