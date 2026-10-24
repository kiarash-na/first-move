"use client"

import { PlusIcon, XIcon } from "lucide-react"
import { useId } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { getAt, parsePath, type FieldDef } from "@/lib/project"
import { useDictionary, useLocale, useTextRef } from "../../../_components/i18n-provider"
import { useStoreState } from "../../../_components/store-provider"
import { FieldError } from "./field-error"
import { FieldLabel } from "./field-label"
import { useFieldPatch } from "./use-field-patch"

type TextListDef = Extract<FieldDef, { kind: "textList" }>

const NONE: readonly string[] = []

/** A list of one-line entries (stakeholders, partners, current supply): one input per entry. */
export function TextListField({ field }: { field: TextListDef }) {
  const id = useId()
  const lang = useLocale()
  const bp = useDictionary("business-plan")
  const textOf = useTextRef()
  const list = useStoreState((state) => {
    const stored = state.active ? getAt(state.active, parsePath(field.id) ?? []) : NONE
    return Array.isArray(stored) ? (stored as readonly string[]) : NONE
  })
  const { patch, error } = useFieldPatch()
  const label = textOf(field.text) ?? field.id
  // An empty list still shows one blank entry to type into.
  const entries = list.length > 0 ? list : [""]
  const set = (next: readonly string[]) => patch({ [field.id]: [...next] })

  return (
    <div role="group" aria-label={label} className="flex min-w-0 flex-col gap-2" id={`field-${field.id}`}>
      <FieldLabel htmlFor={`${id}-0`} helpId={`${id}-help`} label={label} help={textOf(field.text, "help")} />
      <ul className="flex flex-col gap-2">
        {entries.map((entry, index) => (
          <li key={index} className="flex items-center gap-2">
            <Input
              id={`${id}-${index}`}
              aria-label={interpolate(bp.ui.entry, { label, index: formatNumber(index + 1, lang) })}
              aria-describedby={`${id}-help`}
              value={entry}
              maxLength={field.maxLength}
              onChange={(event) => set(entries.map((value, at) => (at === index ? event.target.value : value)))}
            />
            {list.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={interpolate(bp.ui.removeEntry, { index: formatNumber(index + 1, lang) })}
                onClick={() => set(list.filter((_, at) => at !== index))}
              >
                <XIcon strokeWidth={1.6} aria-hidden="true" />
              </Button>
            )}
          </li>
        ))}
      </ul>
      <div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={list.length >= field.maxItems}
          onClick={() => set([...list, ""])}
        >
          <PlusIcon strokeWidth={1.6} aria-hidden="true" />
          {bp.ui.addEntry}
        </Button>
      </div>
      <FieldError>{error}</FieldError>
    </div>
  )
}
