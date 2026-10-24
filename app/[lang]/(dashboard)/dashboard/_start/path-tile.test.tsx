import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { I18nProvider } from "../_components/i18n-provider"
import { testDictionaries } from "../_components/test-utils/dictionaries"
import { PathTile } from "./path-tile"

describe("PathTile", () => {
  it.each(["en", "de"] as const)("shows the path and reports a click (%s)", async (lang) => {
    const onSelect = vi.fn()
    const { start } = testDictionaries(lang)
    render(
      <I18nProvider lang={lang} dictionaries={testDictionaries(lang)}>
        <PathTile path="business-plan" onSelect={onSelect} />
      </I18nProvider>,
    )
    const tile = screen.getByRole("button", { name: new RegExp(start.paths["business-plan"].title) })
    expect(tile).toHaveTextContent(start.paths["business-plan"].meta)
    expect(tile.querySelector(".bg-hot")).not.toBeNull()
    await userEvent.click(tile)
    expect(onSelect).toHaveBeenCalledWith("business-plan")
  })
})
