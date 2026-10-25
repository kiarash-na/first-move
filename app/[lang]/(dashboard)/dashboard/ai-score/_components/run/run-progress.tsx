"use client"

import { CircleCheckIcon, CircleDashedIcon, CircleIcon, CircleSlashIcon, LoaderCircleIcon, type LucideIcon } from "lucide-react"

import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { currentStep, type RunProgress, type StepState } from "./progress"

const ICON: Record<StepState, LucideIcon> = {
  pending: CircleIcon,
  running: LoaderCircleIcon,
  done: CircleCheckIcon,
  failed: CircleSlashIcon,
  skipped: CircleDashedIcon,
}

/**
 * The run step by step (PLAN-AI-SCORE-00 step 6): turn 0 without AI, the four Jev turns with the
 * number of questions, then the report. State is shown by icon and text, never by colour alone.
 */
export function RunProgressList({ progress }: { progress: RunProgress }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const text = copy.run.progress
  const current = currentStep(progress)
  const steps = [
    ...progress.turns.map((entry) => ({
      key: `turn-${entry.turn}`,
      label: `${interpolate(text.turn, { turn: entry.turn })} · ${copy.labels.turns[String(entry.turn) as keyof typeof copy.labels.turns]}`,
      detail: entry.turn === 0 ? text.noAi : entry.questions === null ? null : interpolate(text.questions, { count: formatNumber(entry.questions, lang) }),
      state: entry.state,
      active: current === entry.turn,
    })),
    { key: "report", label: text.report, detail: null, state: progress.report, active: current === "report" },
  ]
  const running = steps.find((step) => step.active)

  return (
    <div data-slot="run-progress" className="flex flex-col gap-2">
      <ol aria-label={text.label} className="grid gap-px border bg-border @2xl:grid-cols-3 @5xl:grid-cols-6">
        {steps.map((step) => {
          const Icon = ICON[step.state]
          return (
            <li
              key={step.key}
              data-step={step.key}
              data-state={step.state}
              aria-current={step.active ? "step" : undefined}
              className={cn("flex min-h-16 flex-col gap-1 bg-card px-3 py-2.5", step.active && "bg-hot/10")}
            >
              <span className="text-sm leading-snug font-[480]">{step.label}</span>
              <span className="flex items-center gap-1.5 font-mono text-xs tracking-[0.04em] text-text-secondary uppercase">
                <Icon
                  className={cn("size-3.5 shrink-0", step.state === "running" && "text-hot motion-safe:animate-spin", step.state === "done" && "text-foreground")}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                {text.states[step.state]}
                {step.detail && <span className="normal-case text-muted-foreground">· {step.detail}</span>}
              </span>
            </li>
          )
        })}
      </ol>
      <p role="status" className="sr-only">
        {running ? `${running.label}: ${text.states.running}` : ""}
      </p>
    </div>
  )
}
