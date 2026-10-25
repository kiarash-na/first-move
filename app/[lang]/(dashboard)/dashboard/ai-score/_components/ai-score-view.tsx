"use client"

import { SparklesIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { gatewayClient, type GatewayClient } from "@/lib/assistant/gateway/client"
import { aiScoreStatus } from "@/lib/business-plan"
import type { ProjectStoreState } from "@/lib/store"
import { useDictionary, useLocale } from "../../_components/i18n-provider"
import { PageHeader } from "../../_components/page-header"
import { useStore, useStoreState } from "../../_components/store-provider"
import { DecisionFlow } from "./flow/decision-flow"
import type { FlowSource } from "./flow/flow-source"
import { SeparateNotice } from "./intro/separate-notice"
import { ScoreResults } from "./results/score-results"
import { RunPanel } from "./run/run-panel"
import { useAnalysis } from "./run/use-analysis"
import { useTextActions } from "./run/use-text-actions"
import { useAcknowledged } from "./setup/acknowledgement"
import { ConnectPanel } from "./setup/connect-panel"
import { chosenModelId, DEFAULT_CHOICE, isValidChoice } from "./setup/model-picker"
import { useMaskedGatewayKey } from "./setup/use-gateway-key"

const selectActive = (state: ProjectStoreState) => state.active

/**
 * The AI Plan Score page (PLAN-AI-SCORE-00 step 6, D-71): a separate AI scoring of the Business
 * Plan. Connect a Gateway key (bring your own, memory only), run Jev turn by turn, follow the
 * decision flow live, and read the saved result. The page owns the key, the text model and the
 * requests; the result views only call `ResultActions`. Renders behind `ProjectGate`, so a
 * project is open. `createClient` is injectable for tests.
 */
export function AiScoreView({ createClient = gatewayClient }: { createClient?: (key: string) => GatewayClient }) {
  const lang = useLocale()
  const shell = useDictionary("shell")
  const copy = useDictionary("ai-score")
  const store = useStore()
  const project = useStoreState(selectActive)
  const masked = useMaskedGatewayKey()
  const acknowledged = useAcknowledged()
  const [model, setModel] = useState(DEFAULT_CHOICE)
  const { run, start, cancel, reset } = useAnalysis(store, createClient)

  const readiness = { key: masked !== null, ack: acknowledged, model: isValidChoice(model) }
  const ready = readiness.key && readiness.ack && readiness.model
  const textModelId = chosenModelId(model)
  const score = project?.aiScore ?? null
  const changed = useMemo(() => (project ? aiScoreStatus(project).changed : []), [project])
  const actions = useTextActions({ store, createClient, project, score, textModelId, lang, ready, onRemove: reset })
  const writing = actions.busy === "report"

  const source = useMemo<FlowSource>(() => {
    if (run.phase === "running" && run.progress) return { mode: "live", progress: run.progress }
    if (score) return { mode: "saved", score, changed, writing }
    if (run.progress) return { mode: "live", progress: run.progress }
    return { mode: "idle" }
  }, [run.phase, run.progress, score, changed, writing])

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
      <ConnectPanel project={project} createClient={createClient} model={model} onModel={setModel} />
      <RunPanel
        project={project}
        run={run}
        readiness={readiness}
        hasScore={score !== null}
        hasReport={score?.report != null}
        writing={writing}
        textError={actions.error}
        onStart={() => void start(project, textModelId, lang)}
        onCancel={cancel}
        onWriteAgain={actions.rewriteReport}
      />
      <DecisionFlow source={source} />
      {score && <ScoreResults project={project} score={score} changed={changed} actions={actions} />}
    </div>
  )
}
