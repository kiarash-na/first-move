"use client"

import { useId } from "react"

import { Input } from "@/components/ui/input"
import { TEXT_MODELS } from "@/lib/assistant/gateway/models"
import { OPENROUTER_MODELS } from "@/lib/assistant/openrouter/models"
import { DEFAULT_MODEL, isModelIdFor, type AssistantModel } from "@/lib/assistant/providers/models"
import type { Provider } from "@/lib/assistant/providers/types"
import { interpolate } from "@/lib/i18n/interpolate"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { formatUsd } from "./usd"

/** The picker's value: a listed model id, or `custom` with the typed id. Not secret, so React state. */
export interface ModelChoice {
  choice: string
  custom: string
}

export const CUSTOM = "custom"

/** The listed default of a provider: the Auto Router on OpenRouter, Claude Sonnet 5.5 on the Gateway. */
export const defaultChoice = (provider: Provider): ModelChoice => ({ choice: DEFAULT_MODEL[provider], custom: "" })

/** The model id a choice stands for, trimmed. */
export const chosenModelId = ({ choice, custom }: ModelChoice) => (choice === CUSTOM ? custom.trim() : choice)

/** The catalogue of a provider for the picker: the Gateway's text models, or OpenRouter's. */
export const catalogue = (provider: Provider): readonly AssistantModel[] => (provider === "gateway" ? TEXT_MODELS : OPENROUTER_MODELS)

/** A listed model, or null for a custom id (its prices are unknown here). */
export const chosenModel = (provider: Provider, value: ModelChoice) => catalogue(provider).find((model) => model.id === chosenModelId(value)) ?? null

export const isValidChoice = (provider: Provider, value: ModelChoice) => isModelIdFor[provider](chosenModelId(value))

/**
 * The text model for the report and the suggestions (D-71: model-agnostic through the chosen
 * provider): the provider's catalogue with the price per million tokens, or any of its model ids.
 */
export function ModelPicker({ provider, value, onChange }: { provider: Provider; value: ModelChoice; onChange: (value: ModelChoice) => void }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score").setup.text
  const name = useId()
  const customId = useId()
  const errorId = useId()
  const custom = value.choice === CUSTOM
  const invalid = custom && value.custom.trim() !== "" && !isModelIdFor[provider](value.custom)
  const usd = (amount: number) => formatUsd(amount, lang, { max: 2 })
  const chosen = chosenModel(provider, value)
  // On the Gateway the ZDR note follows the catalogue; on OpenRouter every call denies data collection.
  const privacyNote = provider === "openrouter" ? copy.deny : chosen && "zdr" in chosen && chosen.zdr ? copy.zdr : null

  return (
    <fieldset data-slot="model-picker" className="flex min-w-0 flex-col gap-3">
      <legend className="mb-1 text-[17px] leading-snug font-[480]">{copy.label}</legend>
      <p className="max-w-[72ch] text-sm leading-relaxed text-text-secondary">{copy.help[provider]}</p>
      <div className="grid gap-2 @2xl:grid-cols-2">
        {catalogue(provider).map((model) => {
          const id = `${name}-${model.id}`
          const checked = value.choice === model.id
          return (
            <label
              key={model.id}
              htmlFor={id}
              className={cn(
                "flex min-h-11 cursor-pointer items-start gap-3 border px-3 py-2.5 transition-colors hover:border-foreground/45",
                checked && "border-hot bg-hot/5",
              )}
            >
              <input id={id} type="radio" name={name} value={model.id} checked={checked} onChange={() => onChange({ ...value, choice: model.id })} className="mt-1 size-4 shrink-0 accent-hot" />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-base leading-snug">
                  {model.name}
                  <span className="ml-2 font-mono text-xs tracking-[0.04em] text-muted-foreground">{model.id.split("/")[0]}</span>
                </span>
                <span className="font-mono text-xs tracking-[0.04em] text-text-secondary">
                  {model.price ? interpolate(copy.price, { input: usd(model.price.input), output: usd(model.price.output) }) : copy.priceUnknown}
                </span>
              </span>
            </label>
          )
        })}
        <label
          htmlFor={`${name}-custom`}
          className={cn("flex min-h-11 cursor-pointer items-center gap-3 border px-3 py-2.5 transition-colors hover:border-foreground/45", custom && "border-hot bg-hot/5")}
        >
          <input id={`${name}-custom`} type="radio" name={name} value={CUSTOM} checked={custom} onChange={() => onChange({ ...value, choice: CUSTOM })} className="size-4 shrink-0 accent-hot" />
          <span className="text-base leading-snug">{copy.custom}</span>
        </label>
      </div>
      {privacyNote && <p className="text-sm text-text-secondary">{privacyNote}</p>}
      {custom && (
        <div className="flex max-w-md flex-col gap-1.5">
          <label htmlFor={customId} className="text-sm font-[480]">
            {copy.customLabel[provider]}
          </label>
          <Input
            id={customId}
            value={value.custom}
            placeholder={copy.customPlaceholder}
            autoComplete="off"
            spellCheck={false}
            autoCapitalize="none"
            aria-invalid={invalid || undefined}
            aria-describedby={errorId}
            onChange={(event) => onChange({ ...value, custom: event.target.value })}
            className="font-mono"
          />
          <p id={errorId} className="text-sm leading-relaxed text-text-secondary">
            {invalid ? interpolate(copy.customInvalid[provider], { example: catalogue(provider)[1].id }) : copy.customPrice[provider]}
          </p>
        </div>
      )}
    </fieldset>
  )
}
