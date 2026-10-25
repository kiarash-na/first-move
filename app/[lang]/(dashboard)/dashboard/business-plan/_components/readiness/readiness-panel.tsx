"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { pitchReadiness } from "@/lib/business-plan"
import { formatNumber, formatPercent } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { useStoreState } from "../../../_components/store-provider"
import { AiScoreBadge } from "../ai-score-badge"
import { AiScoreHow } from "../ai-score-how"
import { SectionPanel } from "../section-panel"
import { ReadinessCard } from "./readiness-card"
import { ReadinessHow } from "./readiness-how"

/**
 * Pitch completeness in full (D-30, D-74; ids keep "readiness"): first the AI Plan Score, bolder,
 * with its caveat and how it is made; then the six parts of the final pitch (BM-SCOPE-07) and,
 * labelled unofficial, the V01 jury criteria (BM-SCOPE-08). The completeness is computed only
 * from filled fields; it never judges what was written.
 */
export function ReadinessPanel({ index }: { index?: number }) {
  const lang = useLocale()
  const bp = useDictionary("business-plan")
  const project = useStoreState((state) => state.active)
  if (!project) return null
  const readiness = pitchReadiness(project)
  const met = readiness.sections.reduce((sum, section) => sum + section.met, 0)
  const total = readiness.sections.reduce((sum, section) => sum + section.total, 0)

  return (
    <SectionPanel id="readiness" index={index} title={bp.readiness.title} help={bp.readiness.lead}>
      <div data-slot="readiness-ai-score" className="flex flex-col gap-3">
        <AiScoreBadge layout="wide" />
        <p className="max-w-[68ch] text-sm leading-relaxed text-text-secondary">{bp.aiScore.caveat} {bp.aiScore.completeness}</p>
        <AiScoreHow />
      </div>

      <div className="flex flex-col gap-4 border-y py-5 sm:flex-row sm:items-center sm:gap-8">
        <p className="flex items-baseline gap-4">
          <span className="font-mono text-5xl leading-none tabular-nums">{formatPercent(readiness.score, lang)}</span>
          <span className="text-base text-text-secondary">{bp.readiness.level[readiness.level]}</span>
        </p>
        <div className="flex flex-1 flex-col gap-2">
          <Progress tone="hot" value={Math.round(readiness.score * 100)} aria-label={bp.readiness.title} />
          <p className="font-mono text-xs tracking-[0.04em] text-muted-foreground">
            {interpolate(bp.readiness.summary, { met: formatNumber(met, lang), total: formatNumber(total, lang) })} · {bp.readiness.caveat}
          </p>
        </div>
      </div>

      <section aria-labelledby="readiness-sections" className="flex flex-col gap-5">
        <h3 id="readiness-sections" className="flex flex-wrap items-baseline gap-x-4 font-mono text-xs tracking-[0.075em] text-hot uppercase">
          {bp.readiness.sections.title}
          <span className="text-muted-foreground">{bp.readiness.sections.source}</span>
        </h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {readiness.sections.map((section) => (
            <ReadinessCard
              key={section.id}
              label={bp.readiness.sections[section.id].label}
              question={bp.readiness.sections[section.id].question}
              group={section}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="readiness-jury" className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h3 id="readiness-jury" className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs tracking-[0.075em] text-hot uppercase">
            {bp.readiness.jury.title}
            <Badge variant="outline">{bp.readiness.unofficial}</Badge>
            <span className="text-muted-foreground">{bp.readiness.jury.source}</span>
          </h3>
          <p className="max-w-[62ch] text-sm leading-relaxed text-text-secondary">{bp.readiness.jury.note}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {readiness.jury.map((criterion) => (
            <ReadinessCard
              key={criterion.id}
              label={bp.readiness.jury[criterion.id].label}
              group={criterion}
              badge={<Badge variant="outline">{bp.readiness.unofficial}</Badge>}
            />
          ))}
        </div>
      </section>

      <ReadinessHow />
    </SectionPanel>
  )
}
