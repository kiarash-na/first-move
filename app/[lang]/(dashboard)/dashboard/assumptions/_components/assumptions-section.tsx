import type { ReactNode } from "react"

/** A titled block of the Assumptions page. */
export function AssumptionsSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5">
      <h2 id={id} className="text-xl leading-tight font-[560] tracking-[-0.035em] [font-stretch:86%]">
        {title}
      </h2>
      {children}
    </section>
  )
}
