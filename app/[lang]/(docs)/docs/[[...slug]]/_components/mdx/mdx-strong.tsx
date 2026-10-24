import type * as React from "react"

/** Bold text (`**…**`). */
export function MdxStrong({ children }: { children?: React.ReactNode }) {
  return <strong className="font-semibold text-foreground">{children}</strong>
}
