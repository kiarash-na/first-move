import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { DEFAULT_TEXT_MODEL, TEXT_MODELS } from "@/lib/assistant/gateway/models"
import { DEFAULT_OPENROUTER_MODEL, OPENROUTER_MODELS } from "@/lib/assistant/openrouter/models"
import type { Provider } from "@/lib/assistant/providers/types"
import { aiScoreCopy, aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { chosenModel, chosenModelId, CUSTOM, defaultChoice, isValidChoice, ModelPicker, type ModelChoice } from "./model-picker"

const copy = aiScoreCopy().setup.text
const CUSTOM_ID = "example/custom-model"
const [first, second, third] = TEXT_MODELS
/** A pattern that finds `text` literally inside a longer accessible name. */
const containing = (text: string) => new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))

function Harness({ provider = "gateway", onChange }: { provider?: Provider; onChange: (value: ModelChoice) => void }) {
  const [value, setValue] = useState(defaultChoice(provider))
  return (
    <ModelPicker
      provider={provider}
      value={value}
      onChange={(next) => {
        setValue(next)
        onChange(next)
      }}
    />
  )
}

describe("ModelPicker (model-agnostic text model, D-71)", () => {
  it("lists the Gateway's curated models with provider and price, the default chosen", () => {
    renderAiScore(<Harness onChange={() => {}} />, { store: aiScoreStore(example()).store })
    expect(screen.getByRole("group", { name: copy.label })).toBeInTheDocument()
    expect(screen.getAllByRole("radio")).toHaveLength(TEXT_MODELS.length + 1)
    expect(screen.getByRole("radio", { name: containing(first.name) })).toBeChecked()
    expect(screen.getByRole("radio", { name: containing(second.name) })).toHaveAccessibleName(
      containing(`$${second.price.input} input · $${second.price.output} output per million tokens`),
    )
    expect(screen.getByText(copy.zdr)).toBeInTheDocument()
  })

  it("lists OpenRouter's models with the Auto Router chosen and the data-collection note", () => {
    renderAiScore(<Harness provider="openrouter" onChange={() => {}} />, { store: aiScoreStore(example()).store })
    expect(screen.getAllByRole("radio")).toHaveLength(OPENROUTER_MODELS.length + 1)
    expect(screen.getByRole("radio", { name: containing(OPENROUTER_MODELS[0].name) })).toBeChecked()
    expect(screen.getByRole("radio", { name: containing(OPENROUTER_MODELS[0].name) })).toHaveAccessibleName(containing(copy.priceUnknown))
    expect(screen.getByText(copy.deny)).toBeInTheDocument()
  })

  it("switches models and validates a custom id per provider", async () => {
    const onChange = vi.fn()
    renderAiScore(<Harness onChange={onChange} />, { store: aiScoreStore(example()).store })
    await userEvent.click(screen.getByRole("radio", { name: containing(third.name) }))
    expect(onChange).toHaveBeenLastCalledWith({ choice: third.id, custom: "" })
    await userEvent.click(screen.getByRole("radio", { name: copy.custom }))
    const field = screen.getByLabelText(copy.customLabel.gateway)
    expect(screen.getByText(copy.customPrice.gateway)).toBeInTheDocument()
    await userEvent.type(field, "Not A Model")
    expect(field).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByText(/Use the Gateway form creator\/model/)).toBeInTheDocument()
    await userEvent.clear(field)
    await userEvent.type(field, CUSTOM_ID)
    expect(field).not.toHaveAttribute("aria-invalid")
    expect(onChange).toHaveBeenLastCalledWith({ choice: CUSTOM, custom: CUSTOM_ID })
  })

  it("resolves a choice to a model id and its listing", () => {
    expect(chosenModelId(defaultChoice("gateway"))).toBe(DEFAULT_TEXT_MODEL)
    expect(chosenModelId(defaultChoice("openrouter"))).toBe(DEFAULT_OPENROUTER_MODEL)
    expect(chosenModel("gateway", defaultChoice("gateway"))?.price).toEqual(TEXT_MODELS[0].price)
    expect(chosenModelId({ choice: CUSTOM, custom: ` ${CUSTOM_ID} ` })).toBe(CUSTOM_ID)
    expect(chosenModel("gateway", { choice: CUSTOM, custom: CUSTOM_ID })).toBeNull()
    expect(isValidChoice("gateway", { choice: CUSTOM, custom: "" })).toBe(false)
    expect(isValidChoice("gateway", defaultChoice("gateway"))).toBe(true)
    expect(isValidChoice("openrouter", defaultChoice("openrouter"))).toBe(true)
  })
})
