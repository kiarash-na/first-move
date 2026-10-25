import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { aiScoreCopy, renderResults } from "./test-utils/render"
import { ViewSwitch } from "./view-switch"

describe("ViewSwitch", () => {
  it.each(["en", "de"] as const)("switches between chart and table (%s)", async (lang) => {
    const onChange = vi.fn()
    const copy = aiScoreCopy(lang).results.dimensions.view
    renderResults(<ViewSwitch value="chart" onChange={onChange} />, { lang })
    expect(screen.getByRole("radio", { name: copy.chart })).toBeChecked()
    await userEvent.click(screen.getByRole("radio", { name: copy.table }))
    expect(onChange).toHaveBeenCalledWith("table")
  })

  it("keeps the view when the active one is pressed again", async () => {
    const onChange = vi.fn()
    renderResults(<ViewSwitch value="table" onChange={onChange} />)
    await userEvent.click(screen.getByRole("radio", { name: aiScoreCopy("en").results.dimensions.view.table }))
    expect(onChange).not.toHaveBeenCalled()
  })
})
