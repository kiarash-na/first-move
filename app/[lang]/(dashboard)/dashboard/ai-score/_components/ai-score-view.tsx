"use client"

import { SparklesIcon } from "lucide-react"
import { useCallback, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { scoreClient } from "@/lib/assistant/plan-score/client"
import { firstProvider } from "@/lib/assistant/providers/first-provider"
import type { Provider } from "@/lib/assistant/providers/types"
import { aiScoreStatus } from "@/lib/business-plan"
import type { ProjectStoreState } from "@/lib/store"
import { useDictionary, useLocale } from "../../_components/i18n-provider"
import { PageHeader } from "../../_components/page-header"
import { useMaskedKey } from "../../_agent/key/use-masked-key"
import { useStore, useStoreState } from "../../_components/store-provider"
import { DecisionFlow } from "./flow/decision-flow"
import type { FlowSource } from "./flow/flow-source"
import { SeparateNotice } from "./intro/separate-notice"
import { ScoreResults } from "./results/score-results"
import { RunPanel } from "./run/run-panel"
import { useAnalysis, type ScoreClientFactory } from "./run/use-analysis"
import { useTextActions } from "./run/use-text-actions"
import { useAcknowledged } from "./setup/acknowledgement"
import { ConnectPanel } from "./setup/connect-panel"
import { chosenModelId, defaultChoice, isValidChoice, type ModelChoice } from "./setup/model-picker"

const selectActive = (state: ProjectStoreState) => state.active

/**
 * The AI Plan Score page (PLAN-AI-SCORE-00 step 6, D-71): a separate AI scoring of the Business
 * Plan. Connect a key of the chosen provider (OpenRouter by default, the Vercel AI Gateway
 * second; owner 2026-10-25), run the decision model turn by turn, follow the decision flow live,
 * and read the saved result. The page owns the provider, the key, the text model and the
 * requests; the result views only call `ResultActions`. Renders behind `ProjectGate`, so a
 * project is open. `createClient` is injectable for tests.
 */
export function AiScoreView({ createClient = scoreClient }: { createClient?: ScoreClientFactory }) {
  const lang = useLocale()
  const shell = useDictionary("shell")
  const copy = useDictionary("ai-score")
  const store = useStore()
  const project = useStoreState(selectActive)
  const [provider, setProvider] = useState<Provider>(firstProvider)
  const [models, setModels] = useState<Record<Provider, ModelChoice>>({ openrouter: defaultChoice("openrouter"), gateway: defaultChoice("gateway") })
  const masked = useMaskedKey(provider)
  const acknowledged = useAcknowledged()
  const { run, start, cancel, reset } = useAnalysis(store, createClient, provider)

  const model = models[provider]
  const readiness = { key: masked !== null, ack: acknowledged, model: isValidChoice(provider, model) }
  const ready = readiness.key && readiness.ack && readiness.model
  const textModelId = chosenModelId(model)
  const score = project?.aiScore ?? null
  const running = run.phase === "running"
  const changed = useMemo(() => (project ? aiScoreStatus(project).changed : []), [project])
  // Deleting the score also stops a run in flight, so its score does not come back.
  const onRemove = useCallback(() => {
    cancel()
    reset()
  }, [cancel, reset])
  const actions = useTextActions({ store, createClient, provider, project, score, textModelId, lang, ready, running, onRemove })
  const writing = actions.busy === "report"

  const source = useMemo<FlowSource>(() => {
    if (running && run.progress) return { mode: "live", progress: run.progress }
    if (score) return { mode: "saved", score, changed, writing }
    if (run.progress) return { mode: "live", progress: run.progress }
    return { mode: "idle" }
  }, [running, run.progress, score, changed, writing])

  if (!project) return null

  return (
    <div className="flex flex-col gap-8" data-slot="ai-score-view">
      <PageHeader
        tone="hot"
        eyebrow={shell.nav.sections.businessPlan}
        title={copy.title}
        description={copy.lead}
        actions={
          <Badge variant="hot">
            <SparklesIcon strokeWidth={1.6} aria-hidden="true" />
            {copy.intro.badge}
          </Badge>
        }
      />
      <SeparateNotice />
      <ConnectPanel project={project} provider={provider} onProvider={setProvider} model={model} onModel={(next) => setModels((current) => ({ ...current, [provider]: next }))} />
      <RunPanel
        project={project}
        run={run}
        readiness={readiness}
        hasScore={score !== null}
        hasReport={score?.report != null}
        writing={writing}
        textBusy={actions.busy !== null}
        textError={actions.error}
        onStart={() => {
          actions.clearError()
          void start(project, textModelId, lang)
        }}
        onCancel={cancel}
        onWriteAgain={actions.rewriteReport}
      />
      <DecisionFlow source={source} />
      {score && <ScoreResults project={project} score={score} changed={changed} actions={actions} />}
    </div>
  )
}
