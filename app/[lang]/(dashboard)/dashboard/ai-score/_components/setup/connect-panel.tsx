"use client"

import { PROVIDERS, type Provider } from "@/lib/assistant/providers/types"
import type { Project } from "@/lib/project"
import { useDictionary } from "../../../_components/i18n-provider"
import { Panel } from "../panel"
import { CostEstimate } from "./cost-estimate"
import { DataDisclosure } from "./data-disclosure"
import { DecisionModel } from "./decision-model"
import { KeyForm } from "./key-form"
import { chosenModel, chosenModelId, ModelPicker, type ModelChoice } from "./model-picker"

/**
 * Step 1 of the page (D-71): the provider (OpenRouter by default, the Vercel AI Gateway second,
 * owner 2026-10-25), then bring your own key of that provider, its decision model, the text
 * model, what is sent and to whom with its confirmation, and the rough cost of a run.
 */
export function ConnectPanel({
  project,
  provider,
  onProvider,
  model,
  onModel,
}: {
  project: Project
  provider: Provider
  onProvider: (provider: Provider) => void
  model: ModelChoice
  onModel: (value: ModelChoice) => void
}) {
  const copy = useDictionary("ai-score").setup

  return (
    <Panel id="ai-score-setup" eyebrow="01" title={copy.title} lead={copy.lead} className="@container">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-[17px] leading-snug font-[480]">{copy.provider.label}</legend>
        <div className="grid gap-2 @2xl:grid-cols-2">
          {PROVIDERS.map((option) => {
            const checked = provider === option
            return (
              <label
                key={option}
                className={
                  "flex min-h-11 cursor-pointer items-start gap-3 border px-3 py-2.5 transition-colors hover:border-foreground/45" +
                  (checked ? " border-hot bg-hot/5" : "")
                }
              >
                <input type="radio" name="ai-score-provider" value={option} checked={checked} onChange={() => onProvider(option)} className="mt-1 size-4 shrink-0 accent-hot" />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-base leading-snug">{copy.providers[option]}</span>
                  <span className="text-sm leading-relaxed text-text-secondary">{copy.provider[option === "openrouter" ? "openrouterHint" : "gatewayHint"]}</span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>
      <KeyForm key={provider} provider={provider} />
      <div className="grid gap-x-10 gap-y-6 border-t pt-6 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <DecisionModel provider={provider} />
        <ModelPicker provider={provider} value={model} onChange={onModel} />
      </div>
      <div className="grid gap-x-10 gap-y-6 border-t pt-6 @4xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <DataDisclosure provider={provider} />
        <CostEstimate project={project} provider={provider} model={chosenModel(provider, model)} modelId={chosenModelId(model)} />
      </div>
    </Panel>
  )
}
