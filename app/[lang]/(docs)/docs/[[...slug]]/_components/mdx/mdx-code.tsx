import type * as React from "react"

/** Inline code, such as a file name (`.firstmove.json`). */
export function MdxCode({ children }: { children?: React.ReactNode }) {
  return <code className="bg-muted px-1 py-0.5 font-mono text-[0.875em] text-foreground">{children}</code>
}
