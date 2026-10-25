"use client"

import { useId, useState } from "react"

import { Input } from "@/components/ui/input"
import { ASSISTANT_MODELS, DEFAULT_MODEL, isModelIdFor } from "@/lib/assistant/providers/models"
import type { Provider } from "@/lib/assistant/providers/types"
import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { useDictionary, useLocale } from "../../_components/i18n-provider"

const CUSTOM = "custom"

/** The model of the chosen provider: a catalogue entry, or any id typed in (it must support tool use). */
export function ModelSelect({ provider, value, onChange }: { provider: Provider; value: string; onChange: (modelId: string) => void }) {
  const copy = useDictionary("assistant").setup.model
  const lang = useLocale()
  const models = ASSISTANT_MODELS[provider]
  const known = models.find((model) => model.id === value)
  const [custom, setCustom] = useState(known ? "" : value)
  const [customOpen, setCustomOpen] = useState(!known)
  const selectId = useId()
  const customId = useId()
  const hintId = useId()
  const customValid = isModelIdFor[provider](custom)
  const price = (amount: number) => formatNumber(amount, lang, { style: "currency", currency: "USD", currencyDisplay: "narrowSymbol", maximumFractionDigits: 2 })

  return (
    <div data-slot="model-select" className="flex flex-col gap-2">
      <label htmlFor={selectId} className="text-sm font-[520]">
        {copy.label}
      </label>
      <select
        id={selectId}
        value={customOpen ? CUSTOM : value}
        aria-describedby={hintId}
        onChange={(event) => {
          if (event.target.value === CUSTOM) {
            setCustomOpen(true)
            if (customValid) onChange(custom.trim())
          } else {
            setCustomOpen(false)
            onChange(event.target.value)
          }
        }}
        className="h-11 w-full border border-input bg-control px-3 text-base text-foreground"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
        <option value={CUSTOM}>{copy.custom}</option>
      </select>
      <p id={hintId} className="text-xs text-muted-foreground">
        {customOpen
          ? copy.customHint
          : known?.price
            ? interpolate(copy.price, { input: price(known.price.input), output: price(known.price.output) })
            : copy.auto}
      </p>
      {customOpen && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={customId} className="text-sm">
            {copy.customLabel}
          </label>
          <Input
            id={customId}
            value={custom}
            placeholder={copy.customPlaceholder}
            spellCheck={false}
            autoCapitalize="none"
            aria-invalid={(custom !== "" && !customValid) || undefined}
            onChange={(event) => {
              const next = event.target.value
              setCustom(next)
              if (isModelIdFor[provider](next)) onChange(next.trim())
            }}
            className="font-mono"
          />
          {custom !== "" && !customValid && (
            <p role="alert" className="text-sm text-hot">
              {interpolate(copy.customInvalid, { example: DEFAULT_MODEL[provider] })}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
