import type * as React from "react"

/** Body text at the preferred measure. */
export function MdxParagraph({ children }: { children?: React.ReactNode }) {
  return <p className="max-w-[68ch] text-base leading-relaxed text-text-secondary">{children}</p>
}
