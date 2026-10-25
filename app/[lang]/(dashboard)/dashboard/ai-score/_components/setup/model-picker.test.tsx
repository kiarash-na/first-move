import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { DEFAULT_TEXT_MODEL, TEXT_MODELS } from "@/lib/assistant/gateway/models"
import { aiScoreCopy, aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { chosenModel, chosenModelId, CUSTOM, DEFAULT_CHOICE, isValidChoice, ModelPicker, type ModelChoice } from "./model-picker"

const copy = aiScoreCopy().setup.text
const CUSTOM_ID = "example/custom-model"
const [first, second, third] = TEXT_MODELS
/** A pattern that finds `text` literally inside a longer accessible name. */
const containing = (text: string) => new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))

function Harness({ onChange }: { onChange: (value: ModelChoice) => void }) {
  const [value, setValue] = useState(DEFAULT_CHOICE)
  return (
    <ModelPicker
      value={value}
      onChange={(next) => {
        setValue(next)
        onChange(next)
      }}
    />
  )
}

describe("ModelPicker (model-agnostic text model, D-71)", () => {
  it("lists the curated models with provider and price, the default chosen", () => {
    renderAiScore(<Harness onChange={() => {}} />, { store: aiScoreStore(example()).store })
    expect(screen.getByRole("group", { name: copy.label })).toBeInTheDocument()
    expect(screen.getAllByRole("radio")).toHaveLength(TEXT_MODELS.length + 1)
    expect(screen.getByRole("radio", { name: containing(first.name) })).toBeChecked()
    expect(screen.getByRole("radio", { name: containing(second.name) })).toHaveAccessibleName(
      containing(`$${second.price.input} input · $${second.price.output} output per million tokens`),
    )
    expect(screen.getByText(copy.zdr)).toBeInTheDocument()
  })

  it("switches models and validates a custom id", async () => {
    const onChange = vi.fn()
    renderAiScore(<Harness onChange={onChange} />, { store: aiScoreStore(example()).store })
    await userEvent.click(screen.getByRole("radio", { name: containing(third.name) }))
    expect(onChange).toHaveBeenLastCalledWith({ choice: third.id, custom: "" })
    await userEvent.click(screen.getByRole("radio", { name: copy.custom }))
    const field = screen.getByLabelText(copy.customLabel)
    expect(screen.getByText(copy.customPrice)).toBeInTheDocument()
    await userEvent.type(field, "Not A Model")
    expect(field).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByText(/Use the Gateway form creator\/model/)).toBeInTheDocument()
    await userEvent.clear(field)
    await userEvent.type(field, CUSTOM_ID)
    expect(field).not.toHaveAttribute("aria-invalid")
    expect(onChange).toHaveBeenLastCalledWith({ choice: CUSTOM, custom: CUSTOM_ID })
  })

  it("resolves a choice to a model id and its listing", () => {
    expect(chosenModelId(DEFAULT_CHOICE)).toBe(DEFAULT_TEXT_MODEL)
    expect(chosenModel(DEFAULT_CHOICE)?.price).toEqual(TEXT_MODELS[0].price)
    expect(chosenModelId({ choice: CUSTOM, custom: ` ${CUSTOM_ID} ` })).toBe(CUSTOM_ID)
    expect(chosenModel({ choice: CUSTOM, custom: CUSTOM_ID })).toBeNull()
    expect(isValidChoice({ choice: CUSTOM, custom: "" })).toBe(false)
    expect(isValidChoice(DEFAULT_CHOICE)).toBe(true)
  })
})
