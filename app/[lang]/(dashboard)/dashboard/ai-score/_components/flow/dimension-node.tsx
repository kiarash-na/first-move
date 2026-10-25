"use client"

import { formatNumber, formatPercent } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import type { AggregateView } from "./aggregate-view"
import { DetailList } from "./detail-list"
import { dimensionName } from "./flow-labels"
import { FlowNodeButton } from "./flow-node-button"

type Dimension = AggregateView["dimensions"][number]

/**
 * One of the seven dimensions in the Aggregate column: its points out of 100 as a thin orange bar
 * on a track, the part a cap cut off as a dashed outline, and the points as text.
 */
export function DimensionNode({ dimension }: { dimension: Dimension }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const text = copy.flow
  const name = dimensionName(copy.labels, dimension.id)
  const points = (value: number) => formatNumber(Math.round(value * 100), lang)
  const cut = dimension.raw > dimension.score

  return (
    <FlowNodeButton
      nodeKey={`dimension:${dimension.id}`}
      kind={text.detail.kinds.dimension}
      title={name}
      data={{ score: Math.round(dimension.score * 100), cap: dimension.cap ?? undefined }}
      trigger={
        <span className="flex min-w-0 flex-1 flex-col gap-1.5 px-2.5 py-2">
          <span className="flex items-baseline justify-between gap-2">
            <span className="text-sm leading-snug">{name}</span>
            <span className="font-mono text-xs tabular-nums">{points(dimension.score)}</span>
          </span>
          <span aria-hidden="true" className="relative block h-1.5 bg-muted">
            <span className="absolute inset-y-0 left-0 bg-hot" style={{ width: `${dimension.score * 100}%` }} />
            {cut && (
              <span
                data-slot="cut"
                className="absolute inset-y-0 border border-dashed border-hot/70"
                style={{ left: `${dimension.score * 100}%`, width: `${(dimension.raw - dimension.score) * 100}%` }}
              />
            )}
          </span>
          {dimension.cap !== null && <span className="font-mono text-xs tracking-[0.04em] text-hot uppercase">{interpolate(text.node.cappedAt, { level: dimension.cap })}</span>}
        </span>
      }
    >
      <p className="text-text-secondary">{copy.labels.dimensions[dimension.id as keyof typeof copy.labels.dimensions]?.description}</p>
      <DetailList
        rows={[
          [text.detail.weight, formatPercent(dimension.weight, lang)],
          [text.detail.beforeCap, interpolate(text.node.points, { value: points(dimension.raw) })],
          [text.detail.afterCap, interpolate(text.node.points, { value: points(dimension.score) })],
          [text.detail.band, `± ${points(dimension.sd)}`],
        ]}
      />
      {dimension.cap !== null && <p className="text-hot">{interpolate(text.node.cappedAt, { level: dimension.cap })}</p>}
    </FlowNodeButton>
  )
}
