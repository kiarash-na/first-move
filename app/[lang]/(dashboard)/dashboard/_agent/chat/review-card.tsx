"use client"

import { CheckIcon, ClipboardCheckIcon, XIcon } from "lucide-react"
import { useId, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import type { Texts } from "@/lib/ai/extract/field-label"
import { displayValue } from "@/lib/assistant/review/display-value"
import { interpolate } from "@/lib/i18n/interpolate"
import { getAt, parsePath, type Project } from "@/lib/project"
import { useDictionary, useLocale } from "../../_components/i18n-provider"
import type { ProposalItem } from "./use-assistant-chat"

/**
 * A proposal the assistant made, for the user to review (D-51, D-60): field, value now and the
 * proposed value; values that cannot apply, unclear ones and conflicts are listed but never
 * selectable. "Apply selected" applies exactly the checked entries through the store.
 */
export function ReviewCard({
  item,
  project,
  onApply,
  onDismiss,
}: {
  item: ProposalItem
  project: Project | null
  onApply: (keys: string[]) => void
  onDismiss: () => void
}) {
  const copy = useDictionary("assistant").review
  const lang = useLocale()
  const shell = useDictionary("shell")
  const quickCheck = useDictionary("quick-check")
  const businessPlan = useDictionary("business-plan")
  const texts = useMemo<Texts>(() => ({ shell, "quick-check": quickCheck, "business-plan": businessPlan }), [shell, quickCheck, businessPlan])
  const { proposal, state } = item
  const [selected, setSelected] = useState<string[]>(() => proposal.valid.map((entry) => entry.key))
  const titleId = useId()
  const open = state === "open"
  const current = (key: string) => (project ? getAt(project, parsePath(key) ?? []) : undefined)
  const show = (key: string, value: unknown) => displayValue(key, value, current(key), lang, texts, copy)

  return (
    <section data-slot="review-card" data-state={state} aria-labelledby={titleId} className="flex flex-col gap-3 border border-primary/60 p-3">
      <h4 id={titleId} className="flex items-center gap-2 text-sm font-[520]">
        <ClipboardCheckIcon className="size-4 text-primary" strokeWidth={1.6} aria-hidden="true" />
        {copy.title}
      </h4>
      <p className="text-xs leading-relaxed text-muted-foreground">{copy.lead}</p>
      {proposal.valid.length > 0 && (
        <ul className="flex flex-col divide-y divide-border border-y">
          {proposal.valid.map((entry) => (
            <li key={entry.key} className="py-2">
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  disabled={!open}
                  checked={selected.includes(entry.key)}
                  onChange={(event) => setSelected((keys) => (event.target.checked ? [...keys, entry.key] : keys.filter((key) => key !== entry.key)))}
                  className="mt-1 size-4 shrink-0 accent-primary"
                />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-[520]">{entry.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {copy.current}: {show(entry.key, current(entry.key))}
                  </span>
                  <span className="text-xs">
                    {copy.proposed}: <span className="font-[520]">{show(entry.key, entry.value)}</span>
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
      {(proposal.invalid.length > 0 || proposal.unclear.length > 0 || proposal.conflicts.length > 0) && (
        <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
          {proposal.invalid.map((entry) => (
            <li key={`invalid-${entry.key}`}>
              {copy.invalid}: {entry.label} ({entry.message})
            </li>
          ))}
          {proposal.unclear.map((entry, index) => (
            <li key={`unclear-${entry.id}-${index}`}>
              {copy.unclear}: {entry.label}
            </li>
          ))}
          {proposal.conflicts.map((entry) => (
            <li key={`conflict-${entry.id}-${entry.row ?? ""}`}>
              {copy.conflict}: {entry.label}
            </li>
          ))}
        </ul>
      )}
      {open ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" disabled={selected.length === 0} onClick={() => onApply(selected)}>
            <CheckIcon strokeWidth={1.6} aria-hidden="true" />
            {copy.apply}
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={onDismiss}>
            <XIcon strokeWidth={1.6} aria-hidden="true" />
            {copy.dismiss}
          </Button>
        </div>
      ) : (
        <p role="status" className="text-sm">
          {state === "applied" ? (item.applied > 0 ? interpolate(copy.applied, { count: item.applied }) : copy.appliedNone) : state === "dismissed" ? copy.dismissed : copy.noProject}
        </p>
      )}
    </section>
  )
}
