"use client"

import type { GatewayClient } from "@/lib/assistant/gateway/client"
import type { Project } from "@/lib/project"
import { useDictionary } from "../../../_components/i18n-provider"
import { Panel } from "../panel"
import { CostEstimate } from "./cost-estimate"
import { DataDisclosure } from "./data-disclosure"
import { DecisionModel } from "./decision-model"
import { KeyForm } from "./key-form"
import { chosenModel, chosenModelId, ModelPicker, type ModelChoice } from "./model-picker"

/**
 * Step 1 of the page (D-71): bring your own Gateway key, the fixed decision model, the text
 * model, what is sent and to whom with its confirmation, and the rough cost of a run.
 */
export function ConnectPanel({
  project,
  createClient,
  model,
  onModel,
}: {
  project: Project
  createClient: (key: string) => GatewayClient
  model: ModelChoice
  onModel: (value: ModelChoice) => void
}) {
  const copy = useDictionary("ai-score").setup

  return (
    <Panel id="ai-score-setup" eyebrow="01" title={copy.title} lead={copy.lead} className="@container">
      <KeyForm createClient={createClient} />
      <div className="grid gap-x-10 gap-y-6 border-t pt-6 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <DecisionModel />
        <ModelPicker value={model} onChange={onModel} />
      </div>
      <div className="grid gap-x-10 gap-y-6 border-t pt-6 @4xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <DataDisclosure />
        <CostEstimate project={project} model={chosenModel(model)} modelId={chosenModelId(model)} />
      </div>
    </Panel>
  )
}
