import type * as React from "react"

/** A bullet list (`- …`). */
export function MdxList({ children }: { children?: React.ReactNode }) {
  return (
    <ul className="max-w-[68ch] list-disc space-y-2 pl-6 text-base leading-relaxed text-text-secondary marker:text-muted-foreground">
      {children}
    </ul>
  )
}
