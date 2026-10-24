import { LockIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"

/**
 * Frame of the read-only Quick Check numbers inside the Business Plan. Cyan marks where the
 * numbers come from (cyan = Quick Check), while the page around it stays orange.
 */
export function QcFrame({
  id,
  title,
  lead,
  readOnlyLabel,
  children,
}: {
  id: string
  title: string
  lead: string
  readOnlyLabel: string
  children: ReactNode
}) {
  const headingId = `${id}-title`

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      data-slot="qc-prefill"
      className="relative flex flex-col gap-6 border bg-background p-[clamp(20px,3vw,32px)] before:absolute before:inset-x-0 before:-top-px before:h-0.5 before:bg-primary"
    >
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          {/* H2: the frame sits directly under the page title, next to the H2 section panels. */}
          <h2 id={headingId} className="font-mono text-xs tracking-[0.075em] text-primary uppercase">
            {title}
          </h2>
          <Badge variant="outline">
            <LockIcon strokeWidth={1.6} aria-hidden="true" />
            {readOnlyLabel}
          </Badge>
        </div>
        <p className="max-w-[62ch] text-sm leading-relaxed text-text-secondary">{lead}</p>
      </header>
      {children}
    </section>
  )
}
