import type * as React from "react"

import { headingId } from "@/lib/docs/heading-id"
import { nodeText } from "@/lib/docs/node-text"

/**
 * A section heading (`## …`) with the anchor id the knowledge index links to: `headingId()` of
 * its text, the same rule as `slugify()` in the generator.
 */
export function MdxH2({ children }: { children?: React.ReactNode }) {
  return (
    <h2
      id={headingId(nodeText(children))}
      className="mt-8 scroll-mt-6 text-[25px] leading-[1.12] font-[560] tracking-[-0.04em] [font-stretch:84%]"
    >
      {children}
    </h2>
  )
}
