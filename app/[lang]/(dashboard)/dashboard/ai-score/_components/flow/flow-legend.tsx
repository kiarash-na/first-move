"use client"

import { SplitIcon } from "lucide-react"

import { LEVEL_IDS } from "@/lib/ai/plan-score/scale"
import { AI_GATE_OUTCOMES } from "@/lib/project"
import { cn } from "@/lib/utils"
import { HATCH_BACKGROUND } from "../../../_components/charts"
import { useDictionary } from "../../../_components/i18n-provider"
import { GateGlyph } from "./gate-glyph"
import { LEVEL_RAMP_CLASS, levelFill } from "./level-ramp"

const LABEL = "font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase"
const ITEM = "inline-flex items-center gap-2 text-sm text-text-secondary"

/**
 * The legend of the flow (dataviz: always present, identity never colour alone): the five level
 * steps with their names, empty and unanswered parts, the four check outcomes as shapes, the
 * branch mark and the edge to a follow-up check.
 */
export function FlowLegend() {
  const copy = useDictionary("ai-score")
  const { labels } = copy
  const text = copy.flow.legend

  return (
    <div data-slot="flow-legend" aria-label={text.label} role="group" className={cn("flex flex-wrap gap-x-8 gap-y-3", LEVEL_RAMP_CLASS)}>
      <div className="flex flex-col gap-1.5">
        <span className={LABEL}>{text.levels}</span>
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
          {LEVEL_IDS.map((id, level) => (
            <li key={id} className={ITEM}>
              <span aria-hidden="true" className="size-3 shrink-0" style={{ background: levelFill(level) }} />
              <span className="font-mono text-xs">{level}</span> {labels.levels[id].name}
            </li>
          ))}
          <li className={ITEM}>
            <span aria-hidden="true" className="size-3 shrink-0 border border-foreground/20" style={{ background: HATCH_BACKGROUND }} />
            {text.empty}
          </li>
          <li className={ITEM}>
            <span aria-hidden="true" className="size-3 shrink-0 border border-dashed border-foreground/60" />
            {text.refused}
          </li>
        </ul>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className={LABEL}>{copy.flow.groups.gates}</span>
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
          {AI_GATE_OUTCOMES.map((outcome) => (
            <li key={outcome} className={ITEM}>
              <GateGlyph outcome={outcome} size={16} />
              {labels.outcomes[outcome]}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className={LABEL}>{copy.flow.groups.branches}</span>
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
          <li className={ITEM}>
            <SplitIcon className="size-4 rotate-90 text-hot" strokeWidth={1.8} aria-hidden="true" />
            {text.branch}
          </li>
          <li className={ITEM}>
            <svg aria-hidden="true" width="28" height="10" viewBox="0 0 28 10" className="shrink-0">
              <path d="M1 5 H22" stroke="var(--muted-foreground)" strokeWidth="1.5" />
              <path d="M20 1 L27 5 L20 9 z" fill="var(--muted-foreground)" />
            </svg>
            {text.edge}
          </li>
        </ul>
      </div>
    </div>
  )
}
