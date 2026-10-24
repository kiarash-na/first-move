import type { ReactNode } from "react"

/** The heading of a start-screen section: title, optional lead and something on the right (a count). */
export function SectionHeading({ id, title, body, aside }: { id: string; title: string; body?: string; aside?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div className="flex max-w-[62ch] flex-col gap-1.5">
        <h2 id={id} className="text-[25px] leading-[1.12] font-[560] tracking-[-0.04em] [font-stretch:84%]">
          {title}
        </h2>
        {body && <p className="text-sm leading-relaxed text-text-secondary sm:text-base">{body}</p>}
      </div>
      {aside}
    </div>
  )
}
