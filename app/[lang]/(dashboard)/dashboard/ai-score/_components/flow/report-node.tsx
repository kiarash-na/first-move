"use client"

import { FileTextIcon, LoaderCircleIcon } from "lucide-react"

import { interpolate } from "@/lib/i18n/interpolate"
import type { AiReport } from "@/lib/project"
import { cn } from "@/lib/utils"
import { useDictionary } from "../../../_components/i18n-provider"
import type { StepState } from "../run/progress"
import { DetailList } from "./detail-list"
import { FlowNodeButton } from "./flow-node-button"

/** The report step: the text model writes from the decided numbers and never changes them. */
export function ReportNode({ state, report }: { state: StepState | "none"; report: AiReport | null }) {
  const copy = useDictionary("ai-score").flow
  const status = report
    ? interpolate(copy.node.reportBy, { model: report.model })
    : state === "running"
      ? copy.node.reportWriting
      : state === "failed"
        ? copy.node.reportFailed
        : copy.node.reportNone

  return (
    <FlowNodeButton
      nodeKey="report:text"
      kind={copy.detail.kinds.report}
      title={copy.detail.kinds.report}
      data={{ state: report ? "done" : state }}
      className={cn(!report && "border-dashed")}
      trigger={
        <span className="flex min-w-0 flex-1 items-start gap-2.5 px-2.5 py-2">
          {state === "running" && !report ? (
            <LoaderCircleIcon className="mt-0.5 size-4 shrink-0 text-hot motion-safe:animate-spin" strokeWidth={1.8} aria-hidden="true" />
          ) : (
            <FileTextIcon className="mt-0.5 size-4 shrink-0 text-hot" strokeWidth={1.8} aria-hidden="true" />
          )}
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm leading-snug">{copy.detail.kinds.report}</span>
            <span className="font-mono text-xs tracking-[0.04em] break-all text-text-secondary">{status}</span>
          </span>
        </span>
      }
    >
      {report ? (
        <DetailList
          rows={[
            [copy.detail.model, <span key="model" className="font-mono text-xs break-all">{report.model}</span>],
            [copy.detail.headline, report.headline],
          ]}
        />
      ) : (
        <p>{status}</p>
      )}
      <p className="text-text-secondary">{copy.how.report}</p>
    </FlowNodeButton>
  )
}
