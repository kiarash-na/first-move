import type { ReactNode } from "react"

/** One topic of "How we score": a small orange heading and its body, named for assistive technology. */
export function HowBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-2.5">
      <h4 className="font-mono text-xs tracking-[0.075em] text-hot uppercase">{title}</h4>
      {children}
    </section>
  )
}
