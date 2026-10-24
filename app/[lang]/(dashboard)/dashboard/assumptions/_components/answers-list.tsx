"use client"

import { useDictionary } from "../../_components/i18n-provider"

/** The resolved open questions the Quick Check applies (OQ-01..22, OQ-26), with their answers. */
export function AnswersList() {
  const copy = useDictionary("assumptions").answers
  const items = Object.entries(copy.items)
  return (
    <div data-slot="answers" className="flex flex-col gap-4">
      <p className="max-w-[64ch] text-sm leading-relaxed text-muted-foreground">{copy.lead}</p>
      <dl className="grid gap-px border bg-border md:grid-cols-2">
        {items.map(([id, item]) => (
          <div key={id} data-question={id} className="flex flex-col gap-1.5 bg-background p-5 md:last:odd:col-span-2">
            <dt className="flex flex-col gap-1">
              <span className="font-mono text-xs tracking-[0.06em] text-primary">{id}</span>
              <span className="text-[15px] leading-snug font-[480]">{item.title}</span>
            </dt>
            <dd className="text-sm leading-relaxed text-text-secondary">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
