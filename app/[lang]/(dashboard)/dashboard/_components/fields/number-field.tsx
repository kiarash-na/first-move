"use client"

import { AlertTriangleIcon } from "lucide-react"
import { useId, type ReactNode } from "react"
import { formatHectares } from "@/lib/i18n/format"
import { getAt, parsePath, type FieldDef, type NumberField as NumberFieldDef } from "@/lib/project"
import { cn } from "@/lib/utils"
import { useLocale, useTextRef } from "../i18n-provider"
import { useStoreState } from "../store-provider"
import { useFieldPatch, useValidationMessage } from "./use-field-patch"
import { useNumberDraft } from "./use-number-draft"

export function isNumberField(field: FieldDef | undefined): field is NumberFieldDef {
  return field?.kind === "integer" || field?.kind === "number" || field?.kind === "percent"
}

/**
 * A number input rendered from its registry entry (D-05): label and help from the dictionary,
 * unit, the hectare companion of the area (D-31), errors from `applyPatch`. Accepts both
 * decimal separators (D-21). `compact` is the share-grid / table-cell variant.
 */
export function NumberField({
  field,
  label,
  hideLabel = false,
  labelClassName,
  hint,
  placeholder,
  compact = false,
  showUnit = true,
  tone = "cool",
  className,
}: {
  field: NumberFieldDef
  /** Replaces the registry label (grid cells share their group's text). */
  label?: string
  /** Visually hidden label (the grid's headers show it); still the input's accessible name. */
  hideLabel?: boolean
  /** Extra label classes, e.g. visible on phones and hidden where grid headers show it. */
  labelClassName?: string
  hint?: ReactNode
  placeholder?: string
  compact?: boolean
  /** Hide the unit (a table header already names it). */
  showUnit?: boolean
  tone?: "cool" | "hot"
  className?: string
}) {
  const lang = useLocale()
  const text = useTextRef()
  const patch = useFieldPatch()
  const message = useValidationMessage()
  const id = useId()
  const value = useStoreState((state) => {
    const stored = state.active ? getAt(state.active, parsePath(field.id) ?? []) : null
    return typeof stored === "number" ? stored : null
  })
  const draft = useNumberDraft(value, lang, (next) => patch({ [field.id]: next }).filter((error) => error.path.startsWith(field.id)))
  const name = label ?? text(field.text) ?? field.id
  const help = compact ? null : text(field.text, "help")
  const describedBy = [draft.error && `${id}-error`, help && `${id}-help`, hint && `${id}-hint`].filter(Boolean).join(" ")

  return (
    <div data-slot="number-field" data-field={field.id} className={cn("flex min-w-0 flex-col", compact ? "gap-1" : "gap-2", className)}>
      <label
        htmlFor={id}
        className={cn(
          hideLabel ? "sr-only" : compact ? "font-mono text-xs tracking-[0.04em] text-muted-foreground" : "text-[15px] leading-snug font-[480]",
          labelClassName,
        )}
      >
        {name}
      </label>
      {help && (
        <p id={`${id}-help`} className="-mt-1 max-w-[58ch] text-sm leading-normal text-muted-foreground">
          {help}
        </p>
      )}
      <div
        className={cn(
          "group/input flex min-h-11 items-stretch border border-input bg-control transition-colors duration-[180ms]",
          "focus-within:border-primary focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring has-[input[aria-invalid=true]]:border-hot",
          tone === "hot" && "focus-within:border-hot focus-within:outline-hot",
        )}
      >
        <input
          id={id}
          type="text"
          inputMode={field.kind === "integer" ? "numeric" : "decimal"}
          autoComplete="off"
          spellCheck={false}
          value={draft.text}
          placeholder={placeholder}
          aria-invalid={draft.error ? true : undefined}
          aria-describedby={describedBy || undefined}
          onChange={(event) => draft.change(event.target.value)}
          onBlur={draft.blur}
          className={cn(
            "h-11 w-full min-w-0 flex-1 bg-transparent font-mono text-foreground tabular-nums outline-none placeholder:text-muted-foreground/80",
            compact ? "px-2.5 text-right text-sm" : "px-3.5 text-base",
          )}
        />
        {showUnit && field.unit && (
          <span
            aria-hidden="true"
            className={cn(
              "flex shrink-0 items-center font-mono text-xs tracking-[0.04em] text-muted-foreground",
              compact ? "pr-2.5" : "border-l px-3",
            )}
          >
            {field.unit}
          </span>
        )}
      </div>
      {field.companion === "hectares" && value !== null && (
        <p className="font-mono text-xs tracking-[0.04em] text-muted-foreground" aria-live="polite">
          = {formatHectares(value, lang)}
        </p>
      )}
      {hint && (
        <div id={`${id}-hint`} className="text-sm leading-normal text-muted-foreground">
          {hint}
        </div>
      )}
      {draft.error && (
        <p id={`${id}-error`} role="alert" className="flex items-start gap-1.5 text-sm leading-snug text-hot">
          <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
          {message(draft.error)}
        </p>
      )}
    </div>
  )
}
