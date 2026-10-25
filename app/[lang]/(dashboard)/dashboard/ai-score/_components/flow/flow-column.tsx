"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { useDictionary } from "../../../_components/i18n-provider"
import type { StepState } from "../run/progress"

/** Ghost nodes shown while a turn is deciding, at most this many. */
const MAX_GHOSTS = 6

/**
 * One column of the decision flow: a step of the run with its eyebrow ("Turn 2"), name and who
 * decides it ("Jev", "No AI", "Text model"), a 2px rule that tells the state (orange and pulsing
 * while it runs, motion only when allowed), and its nodes once the step ended.
 */
export function FlowColumn({
  id,
  eyebrow,
  title,
  note,
  state,
  questions = null,
  ghosts: showGhosts = true,
  runningText,
  hasNodes,
  children,
  className,
}: {
  id: string
  eyebrow: string
  title: string
  note: string
  state: StepState
  /** Questions of a running turn, for its ghost nodes. */
  questions?: number | null
  /** Ghost nodes while it runs (off for a column whose node shows its own progress). */
  ghosts?: boolean
  /** The line under the header while it runs; null for none. */
  runningText?: string | null
  hasNodes: boolean
  children?: ReactNode
  className?: string
}) {
  const copy = useDictionary("ai-score")
  const headingId = `flow-column-${id}`
  const waiting =
    state === "pending"
      ? copy.flow.state.pending
      : state === "running"
        ? runningText === undefined
          ? copy.flow.state.running
          : runningText
        : state === "done"
          ? null
          : copy.run.progress.states[state]
  const ghosts = state === "running" && showGhosts ? Math.min(MAX_GHOSTS, Math.max(2, questions ?? 2)) : 0

  return (
    <li data-slot="flow-column" data-column={id} data-state={state} aria-labelledby={headingId} aria-busy={state === "running" || undefined} className={cn("flex min-w-0 flex-col gap-3", className)}>
      <header
        className={cn(
          "flex flex-col gap-0.5 border-t-2 pt-2.5",
          state === "done" && "border-foreground/70",
          state === "running" && "border-hot motion-safe:animate-pulse",
          (state === "pending" || state === "skipped") && "border-border",
          state === "failed" && "border-dashed border-hot",
        )}
      >
        <span className="font-mono text-xs tracking-[0.06em] text-hot uppercase">{eyebrow}</span>
        <h4 id={headingId} className="text-base leading-tight font-[560] tracking-[-0.02em] [font-stretch:88%]">
          {title}
        </h4>
        <span className="font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase">{note}</span>
      </header>
      {waiting && <p className="text-sm text-text-secondary">{waiting}</p>}
      {ghosts > 0 && (
        <div aria-hidden="true" className="flex flex-col gap-1.5">
          {Array.from({ length: ghosts }, (_, index) => (
            <span key={index} data-slot="ghost" className="block h-11 border border-dashed bg-muted/50 motion-safe:animate-pulse" />
          ))}
        </div>
      )}
      {children}
      {state === "done" && !hasNodes && <p className="text-sm text-text-secondary">{copy.flow.state.none}</p>}
    </li>
  )
}
