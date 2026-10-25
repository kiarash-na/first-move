"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { displayScore } from "@/lib/business-plan"
import { EMPTY_VALUE, formatNumber, formatQuantity } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { AiReport } from "@/lib/project"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import type { AggregateView } from "./aggregate-view"
import { dimensionName, gateName, nodeName, turnName } from "./flow-labels"
import type { FlowGraph } from "./flow-model"
import { branchText, gateText, judgementText } from "./node-text"

interface Row {
  key: string
  item: string
  step: string
  kind: string
  result: string
  certainty: string | null
}

/**
 * The decision flow as a table (the WCAG-clean twin of the graph, like `ChartTable`): one row per
 * node in reading order, with the same words the nodes show.
 */
export function FlowTable({ graph, aggregate, report }: { graph: FlowGraph; aggregate: AggregateView | null; report: AiReport | null }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const { labels } = copy
  const text = copy.flow
  const quickCheck = useDictionary("quick-check").results.levels
  const turn = (value: number) => `${interpolate(text.columns.turn, { turn: value })} · ${turnName(labels, value)}`
  const points = (value: number) => formatNumber(Math.round(value * 100), lang)

  const rows: Row[] = []
  if (graph.signal !== undefined) {
    rows.push({
      key: "signal",
      item: text.detail.kinds.signal,
      step: turn(0),
      kind: text.detail.kinds.signal,
      result: graph.signal
        ? `${quickCheck[graph.signal.level].label} · ${interpolate(text.node.heatDensity, { value: formatQuantity(graph.signal.heatDensityMwhPerM, "MWh/m", lang, { maximumFractionDigits: 2 }) })}`
        : text.node.signalNone,
      certainty: null,
    })
  }
  for (const node of graph.empty) {
    rows.push({ key: `empty-${node.id}`, item: nodeName(labels, node), step: turn(0), kind: text.detail.kinds.judgement, ...judgementText(node, copy, lang) })
  }
  for (const column of graph.turns) {
    for (const node of column.judgements) rows.push({ key: `judgement-${node.id}`, item: nodeName(labels, node), step: turn(column.turn), kind: text.detail.kinds.judgement, ...judgementText(node, copy, lang) })
    for (const node of column.gates) {
      rows.push({ key: `gate-${node.id}`, item: nodeName(labels, node), step: turn(column.turn), kind: node.branch ? text.detail.kinds.followUp : text.detail.kinds.gate, ...gateText(node, copy, lang) })
    }
    for (const node of column.branches) {
      const opened = node.followUp ? ` → ${gateName(labels, node.followUp)}` : ""
      const described = branchText(node, copy, lang)
      rows.push({ key: `branch-${node.id}`, item: nodeName(labels, node), step: turn(column.turn), kind: text.detail.kinds.branch, result: `${described.result}${opened}`, certainty: described.certainty })
    }
  }
  if (aggregate) {
    for (const dimension of aggregate.dimensions) {
      const capped = dimension.cap === null ? "" : ` · ${interpolate(text.node.cappedAt, { level: dimension.cap })}`
      rows.push({
        key: `dimension-${dimension.id}`,
        item: dimensionName(labels, dimension.id),
        step: text.columns.aggregate,
        kind: text.detail.kinds.dimension,
        result: `${interpolate(text.node.points, { value: points(dimension.score) })}${capped}`,
        certainty: `± ${points(dimension.sd)}`,
      })
    }
    const shown = displayScore(aggregate.score, aggregate.sd)
    rows.push({
      key: "score",
      item: text.node.final,
      step: text.columns.aggregate,
      kind: text.detail.kinds.score,
      result: `${interpolate(text.node.score, { score: formatNumber(shown.score, lang), band: formatNumber(shown.band, lang) })} · ${labels.scoreLevels[aggregate.level].name}`,
      certainty: null,
    })
  }
  if (report) {
    rows.push({ key: "report", item: text.detail.kinds.report, step: text.columns.report, kind: text.detail.kinds.report, result: interpolate(text.node.reportBy, { model: report.model }), certainty: null })
  }

  return (
    <div data-slot="flow-table" className="border">
      <Table aria-label={text.table.caption}>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">{text.table.heading}</TableHead>
            <TableHead scope="col">{text.table.turn}</TableHead>
            <TableHead scope="col">{text.table.kind}</TableHead>
            <TableHead scope="col">{text.table.result}</TableHead>
            <TableHead scope="col" className="text-right">
              {text.table.certainty}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.key} data-row={row.key}>
              <TableHead scope="row" className="font-normal whitespace-normal text-foreground">
                {row.item}
              </TableHead>
              <TableCell className="whitespace-normal text-text-secondary">{row.step}</TableCell>
              <TableCell className="whitespace-normal text-text-secondary">{row.kind}</TableCell>
              <TableCell className="whitespace-normal">{row.result}</TableCell>
              <TableCell className="text-right font-mono text-sm tabular-nums">{row.certainty ?? EMPTY_VALUE}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
