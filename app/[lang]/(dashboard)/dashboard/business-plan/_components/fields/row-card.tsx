"use client"

import { FlagIcon, Trash2Icon } from "lucide-react"
import { useId } from "react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { interpolate } from "@/lib/i18n/interpolate"
import type { FieldDef } from "@/lib/project"
import { cn } from "@/lib/utils"
import { useDictionary, useTextRef } from "../../../_components/i18n-provider"
import { BoundText } from "./bound-text"

type ItemsDef = Extract<FieldDef, { kind: "items" }>

/**
 * One row of an item list (allocation, critical assumptions, risks): its text properties as
 * inputs, and a flag property (the potential deal-breaker) as a switch. Single-line texts come
 * first, multi-line texts side by side below.
 */
export function RowCard({
  field,
  index,
  row,
  onToggleFlag,
  onRemove,
}: {
  field: ItemsDef
  index: number
  row: Record<string, unknown>
  /** Sets a flag property on this row (the list clears it on the other rows). */
  onToggleFlag: (key: string, value: boolean) => void
  onRemove: () => void
}) {
  const bp = useDictionary("business-plan")
  const textOf = useTextRef()
  const titleId = useId()
  const rowName = bp.ui.row[field.id as keyof typeof bp.ui.row] ?? field.id
  const headline = field.properties.find((property) => property.kind === "text")
  const headlineText = headline && typeof row[headline.key] === "string" ? (row[headline.key] as string) : ""
  const shortProps = field.properties.filter((property) => property.kind === "text")
  const longProps = field.properties.filter((property) => property.kind === "longText")
  const flags = field.properties.filter((property) => property.kind === "boolean")

  return (
    <li>
      <article aria-labelledby={titleId} className="flex flex-col gap-5 border bg-background p-5 sm:p-6">
        <header className="flex items-center gap-3">
          <span className="font-mono text-xs tracking-[0.075em] text-hot uppercase tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h4 id={titleId} className="min-w-0 flex-1 truncate text-lg leading-tight font-[520] tracking-[-0.02em]">
            {headlineText || interpolate(bp.ui.entry, { label: rowName, index: index + 1 })}
          </h4>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={interpolate(bp.ui.removeRow, { row: `${rowName} ${index + 1}` })}
            onClick={onRemove}
          >
            <Trash2Icon strokeWidth={1.6} aria-hidden="true" />
          </Button>
        </header>
        {shortProps.map((property) => (
          <BoundText
            key={property.key}
            path={`${field.id}.${index}.${property.key}`}
            multiline={false}
            maxLength={property.maxLength ?? 200}
            label={textOf(property.text) ?? property.key}
            domId={`field-${field.id}.${index}.${property.key}`}
          />
        ))}
        <div className={cn("grid gap-5", longProps.length >= 3 ? "md:grid-cols-3" : longProps.length === 2 ? "md:grid-cols-2" : "")}>
          {longProps.map((property) => (
            <BoundText
              key={property.key}
              path={`${field.id}.${index}.${property.key}`}
              multiline
              maxLength={property.maxLength ?? 5000}
              label={textOf(property.text) ?? property.key}
              domId={`field-${field.id}.${index}.${property.key}`}
            />
          ))}
        </div>
        {flags.map((property) => (
          <FlagSwitch
            key={property.key}
            label={textOf(property.text) ?? property.key}
            on={row[property.key] === true}
            onChange={(value) => onToggleFlag(property.key, value)}
          />
        ))}
      </article>
    </li>
  )
}

function FlagSwitch({ label, on, onChange }: { label: string; on: boolean; onChange: (value: boolean) => void }) {
  const id = useId()
  const bp = useDictionary("business-plan")

  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4", on && "text-hot")}>
      <Switch
        id={id}
        checked={on}
        onCheckedChange={onChange}
        aria-describedby={`${id}-hint`}
        className="data-[state=checked]:border-hot data-[state=checked]:bg-hot"
      />
      <label htmlFor={id} className="flex cursor-pointer items-center gap-2 font-mono text-xs tracking-[0.06em] uppercase">
        <FlagIcon className="size-4" strokeWidth={1.6} aria-hidden="true" />
        {label}
      </label>
      {on && <span className="font-mono text-xs tracking-[0.06em] uppercase">{bp.ui.dealBreaker.marked}</span>}
      <p id={`${id}-hint`} className="basis-full text-sm leading-snug text-muted-foreground">
        {bp.ui.dealBreaker.hint}
      </p>
    </div>
  )
}
