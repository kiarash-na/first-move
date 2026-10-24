"use client"

import type { ReactNode } from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/** Label and optional help line above an input (every input has a visible label, DESIGN-TOKENS §7). */
export function FieldLabel({
  htmlFor,
  helpId,
  label,
  help,
  className,
  children,
}: {
  htmlFor?: string
  helpId?: string
  label: string
  help?: string | null
  className?: string
  /** Extra content on the label row, for example a tag. */
  children?: ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Label htmlFor={htmlFor}>{label}</Label>
        {children}
      </div>
      {help && (
        <p id={helpId} className="max-w-[62ch] text-sm leading-snug text-muted-foreground">
          {help}
        </p>
      )}
    </div>
  )
}
