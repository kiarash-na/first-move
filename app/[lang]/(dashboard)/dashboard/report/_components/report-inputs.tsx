"use client"

import { lookup } from "@/lib/i18n/lookup"
import type { Project } from "@/lib/project"
import { quickCheckInputs } from "@/lib/report/quick-check-inputs"
import { useDictionary } from "../../_components/i18n-provider"
import { ReportInputValue } from "./report-input-value"

/** The Quick Check inputs, one table per step, exactly as entered (`quickCheckInputs`). */
export function ReportInputs({ project }: { project: Project }) {
  const quickCheck = useDictionary("quick-check")
  const steps = useDictionary("shell").nav.items.quickCheck

  return (
    <div data-slot="report-inputs" className="grid gap-6 md:grid-cols-2 print:grid-cols-2">
      {quickCheckInputs(project).map(({ step, inputs }) => (
        <div key={step} className="flex flex-col gap-2 break-inside-avoid">
          <h3 className="font-mono text-xs tracking-[0.075em] text-primary uppercase">{steps[step]}</h3>
          <dl className="flex flex-col divide-y border-y">
            {inputs.map((input) => (
              <div key={input.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 py-2 text-sm">
                <dt className="leading-snug text-text-secondary">
                  {input.label.map((part) => lookup(quickCheck, part.key)).join(" · ")}
                </dt>
                <dd className="text-right font-mono text-[13px] tabular-nums">
                  <ReportInputValue value={input.value} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  )
}
