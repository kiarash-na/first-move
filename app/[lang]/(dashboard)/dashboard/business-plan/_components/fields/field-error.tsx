import { AlertTriangleIcon } from "lucide-react"

/** A failed patch next to its input: orange + icon + text (§2 states are never colour alone). */
export function FieldError({ id, children }: { id?: string; children: string | null }) {
  if (!children) return null
  return (
    <p id={id} role="alert" className="flex items-start gap-2 text-sm leading-snug text-hot">
      <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" strokeWidth={1.6} aria-hidden="true" />
      {children}
    </p>
  )
}
