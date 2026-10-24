"use client"

import { useId, type ReactNode } from "react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getAt, parsePath } from "@/lib/project"
import { cn } from "@/lib/utils"
import { useStoreState } from "../../../_components/store-provider"
import { FieldError } from "./field-error"
import { FieldLabel } from "./field-label"
import { useFieldPatch } from "./use-field-patch"

/**
 * A text input bound to one path of the open project, with its visible label and help. Typing
 * patches the store at once (`applyPatch` validates); the text is stored as typed (D-21).
 */
export function BoundText({
  path,
  multiline,
  maxLength,
  label,
  help,
  domId,
  tag,
  className,
  inputClassName,
}: {
  /** Registry id or row path, for example `site.name` or `businessPlan.risks.0.title`. */
  path: string
  multiline: boolean
  maxLength: number
  label: string
  help?: string | null
  /** Anchor id of the field. */
  domId?: string
  /** Shown next to the label, for example the canvas "Focus" tag. */
  tag?: ReactNode
  className?: string
  inputClassName?: string
}) {
  const id = useId()
  const value = useStoreState((state) => {
    const stored = state.active ? getAt(state.active, parsePath(path) ?? []) : ""
    return typeof stored === "string" ? stored : ""
  })
  const { patch, error } = useFieldPatch()
  const helpId = help ? `${id}-help` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined
  const inputId = domId ?? id

  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <FieldLabel htmlFor={inputId} helpId={helpId} label={label} help={help}>
        {tag}
      </FieldLabel>
      {multiline ? (
        <Textarea
          id={inputId}
          value={value}
          maxLength={maxLength}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={inputClassName}
          onChange={(event) => patch({ [path]: event.target.value })}
        />
      ) : (
        <Input
          id={inputId}
          value={value}
          maxLength={maxLength}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          onChange={(event) => patch({ [path]: event.target.value })}
        />
      )}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  )
}
