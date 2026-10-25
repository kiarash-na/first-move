import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ASSISTANT_MODELS, DEFAULT_MODEL } from "@/lib/assistant/providers/models"
import { interpolate } from "@/lib/i18n/interpolate"
import { assistantCopy, renderAgent } from "../test-utils/render"
import { ModelSelect } from "./model-select"

const copy = assistantCopy().setup.model

describe("ModelSelect", () => {
  it("lists the provider's catalogue and another-model option", () => {
    renderAgent(<ModelSelect provider="openrouter" value={DEFAULT_MODEL.openrouter} onChange={vi.fn()} />)
    const options = screen.getAllByRole("option").map((option) => option.getAttribute("value"))
    expect(options).toEqual([...ASSISTANT_MODELS.openrouter.map((model) => model.id), "custom"])
    expect(screen.getByLabelText(copy.label)).toHaveValue(DEFAULT_MODEL.openrouter)
  })

  it("picks a catalogue model", async () => {
    const onChange = vi.fn()
    renderAgent(<ModelSelect provider="gateway" value={DEFAULT_MODEL.gateway} onChange={onChange} />)
    const other = ASSISTANT_MODELS.gateway.find((model) => model.id !== DEFAULT_MODEL.gateway)!
    await userEvent.selectOptions(screen.getByLabelText(copy.label), other.id)
    expect(onChange).toHaveBeenCalledWith(other.id)
  })

  it("takes a typed model id only in the form creator/model", async () => {
    const onChange = vi.fn()
    renderAgent(<ModelSelect provider="openrouter" value={DEFAULT_MODEL.openrouter} onChange={onChange} />)
    await userEvent.selectOptions(screen.getByLabelText(copy.label), "custom")
    const field = screen.getByLabelText(copy.customLabel)
    await userEvent.type(field, "not a model")
    expect(screen.getByRole("alert")).toHaveTextContent(interpolate(copy.customInvalid, { example: DEFAULT_MODEL.openrouter }))
    expect(onChange).not.toHaveBeenCalled()
    await userEvent.clear(field)
    await userEvent.type(field, "mistral/large-3")
    expect(onChange).toHaveBeenLastCalledWith("mistral/large-3")
  })
})
