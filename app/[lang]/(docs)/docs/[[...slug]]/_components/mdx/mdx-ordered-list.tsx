import type * as React from "react"

/** A numbered list (`1. …`). */
export function MdxOrderedList({ children }: { children?: React.ReactNode }) {
  return (
    <ol className="max-w-[68ch] list-decimal space-y-2 pl-6 text-base leading-relaxed text-text-secondary marker:text-muted-foreground">
      {children}
    </ol>
  )
}
