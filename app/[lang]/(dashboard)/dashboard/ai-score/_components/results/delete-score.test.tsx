import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { DeleteScore } from "./delete-score"
import { aiScoreCopy, renderResults } from "./test-utils/render"

const copy = aiScoreCopy("en").results.remove

describe("DeleteScore", () => {
  it("deletes only after the confirmation", async () => {
    const onDelete = vi.fn()
    renderResults(<DeleteScore onDelete={onDelete} />)
    await userEvent.click(screen.getByRole("button", { name: copy.action }))
    const dialog = screen.getByRole("alertdialog", { name: copy.title })
    expect(dialog).toHaveTextContent(copy.body)
    expect(onDelete).not.toHaveBeenCalled()
    await userEvent.click(within(dialog).getByRole("button", { name: copy.confirm }))
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it("keeps the score when cancelled", async () => {
    const onDelete = vi.fn()
    renderResults(<DeleteScore onDelete={onDelete} />, { lang: "de" })
    const de = aiScoreCopy("de").results.remove
    await userEvent.click(screen.getByRole("button", { name: de.action }))
    await userEvent.click(screen.getByRole("button", { name: de.cancel }))
    expect(onDelete).not.toHaveBeenCalled()
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
  })

  it("can be disabled while a request runs", () => {
    renderResults(<DeleteScore onDelete={vi.fn()} disabled />)
    expect(screen.getByRole("button", { name: copy.action })).toBeDisabled()
  })
})
