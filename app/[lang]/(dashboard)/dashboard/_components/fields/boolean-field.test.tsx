import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { getField, type BooleanField as BooleanFieldDef } from "@/lib/project"
import { renderDashboard } from "../test-utils/render"
import { emptyProject, projectStore } from "../test-utils/project-store"
import { BooleanField } from "./boolean-field"

describe("BooleanField", () => {
  it("toggles PV through the store and says its state", async () => {
    const { store, current } = projectStore(emptyProject())
    renderDashboard(<BooleanField field={getField("sources.pv") as BooleanFieldDef} />, { store })
    const toggle = screen.getByRole("switch", { name: quickCheck.fields.sources.pv.label })
    expect(screen.getByText(quickCheck.ui.field.off)).toBeInTheDocument()
    await userEvent.click(toggle)
    expect(current().sources.pv).toBe(true)
    expect(toggle).toHaveAttribute("aria-checked", "true")
    expect(screen.getByText(quickCheck.ui.field.on)).toBeInTheDocument()
  })
})
