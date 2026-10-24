import { act, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import shell from "@/dictionaries/en/shell.json"
import { getField } from "@/lib/project"
import { renderDashboard } from "../test-utils/render"
import { emptyProject, projectStore } from "../test-utils/project-store"
import { isNumberField, NumberField } from "./number-field"

const field = (id: string) => {
  const def = getField(id)
  if (!isNumberField(def)) throw new Error(id)
  return def
}

describe("NumberField (D-05, D-21)", () => {
  it("renders label, help and unit from the registry and patches every keystroke", async () => {
    const { store, patch, current } = projectStore(emptyProject())
    renderDashboard(<NumberField field={field("buildings.areaM2")} />, { store })
    const input = screen.getByRole("textbox", { name: quickCheck.fields.buildings.areaM2.label })
    expect(screen.getByText(quickCheck.fields.buildings.areaM2.help)).toBeInTheDocument()
    expect(screen.getByText("m²")).toBeInTheDocument()
    await userEvent.type(input, "12500")
    expect(patch).toHaveBeenLastCalledWith({ "buildings.areaM2": 12500 })
    expect(current().buildings.areaM2).toBe(12500)
    expect(screen.getByText("= 1.25 ha")).toBeInTheDocument()
    await userEvent.tab()
    expect(input).toHaveValue("12,500")
  })

  it("accepts a comma as decimal separator in EN and a dot in DE", async () => {
    const { store, current } = projectStore(emptyProject())
    renderDashboard(<NumberField field={field("quickCheck.networkLengthM")} />, { store })
    await userEvent.type(screen.getByRole("textbox"), "12,5")
    expect(current().quickCheck.networkLengthM).toBe(12.5)
    const de = projectStore(emptyProject())
    renderDashboard(<NumberField field={field("quickCheck.networkLengthM")} label="DE" />, { store: de.store, lang: "de" })
    await userEvent.type(screen.getByRole("textbox", { name: "DE" }), "7.5")
    expect(de.current().quickCheck.networkLengthM).toBe(7.5)
  })

  it("shows the applyPatch error and keeps the value from before the edit", async () => {
    const { store, current } = projectStore(emptyProject())
    renderDashboard(<NumberField field={field("buildings.total")} />, { store })
    const input = screen.getByRole("textbox")
    await userEvent.type(input, "4")
    await userEvent.tab()
    await userEvent.type(input, ".5")
    expect(screen.getByRole("alert")).toHaveTextContent(shell.validation.integer)
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(current().buildings.total).toBe(4)
    await userEvent.clear(input)
    await userEvent.type(input, "abc")
    expect(screen.getByRole("alert")).toHaveTextContent(shell.validation.type)
    await userEvent.clear(input)
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(current().buildings.total).toBeNull()
  })

  it("never keeps the prefix of a rejected number (100001 passes through 10000)", async () => {
    const { store, current } = projectStore(emptyProject())
    renderDashboard(<NumberField field={field("buildings.total")} />, { store })
    const input = screen.getByRole("textbox")
    await userEvent.type(input, "120")
    await userEvent.tab()
    await userEvent.clear(input)
    await userEvent.type(input, "100001")
    expect(screen.getByRole("alert")).toBeInTheDocument()
    expect(input).toHaveValue("100001")
    expect(current().buildings.total).toBe(120)
    await userEvent.tab()
    expect(input).toHaveValue("100001")
    expect(current().buildings.total).toBe(120)
  })

  it("follows changes made elsewhere", () => {
    const { store, patch } = projectStore(emptyProject())
    renderDashboard(<NumberField field={field("buildings.total")} />, { store })
    act(() => {
      patch({ "buildings.total": 12 })
    })
    expect(screen.getByRole("textbox")).toHaveValue("12")
  })
})
