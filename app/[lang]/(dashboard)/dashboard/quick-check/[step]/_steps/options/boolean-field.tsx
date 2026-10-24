"use client"

import { useId } from "react"
import { Switch } from "@/components/ui/switch"
import { getAt, parsePath, type BooleanField as BooleanFieldDef } from "@/lib/project"
import { cn } from "@/lib/utils"
import { useDictionary, useTextRef } from "../../../../_components/i18n-provider"
import { useStoreState } from "../../../../_components/store-provider"
import { useFieldPatch } from "../../../../_components/fields/use-field-patch"

/** A yes/no input rendered from its registry entry, with its state as text (DESIGN-TOKENS §7). */
export function BooleanField({ field, className }: { field: BooleanFieldDef; className?: string }) {
  const text = useTextRef()
  const copy = useDictionary("quick-check").ui.field
  const patch = useFieldPatch()
  const id = useId()
  const checked = useStoreState((state) => (state.active ? getAt(state.active, parsePath(field.id) ?? []) === true : false))
  const help = text(field.text, "help")

  return (
    <div data-slot="boolean-field" data-field={field.id} className={cn("flex items-start justify-between gap-6", className)}>
      <div className="flex min-w-0 flex-col gap-1">
        <label htmlFor={id} className="text-[15px] leading-snug font-[480]">
          {text(field.text) ?? field.id}
        </label>
        {help && (
          <p id={`${id}-help`} className="max-w-[58ch] text-sm leading-normal text-muted-foreground">
            {help}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3 pt-0.5">
        <span aria-hidden="true" className={cn("w-8 text-right font-mono text-xs uppercase", checked ? "text-primary" : "text-muted-foreground")}>
          {checked ? copy.on : copy.off}
        </span>
        <Switch
          id={id}
          checked={checked}
          aria-describedby={help ? `${id}-help` : undefined}
          onCheckedChange={(next) => patch({ [field.id]: next })}
        />
      </div>
    </div>
  )
}
