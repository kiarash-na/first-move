import type * as React from "react"

import type { Dictionary } from "@/lib/i18n/dictionaries"
import { cn } from "@/lib/utils"

/** Shared 404 body for `global-not-found` and each root layout's `not-found`. */
export function NotFoundView({
  copy,
  children,
  className,
}: {
  copy: Dictionary<"common">["notFound"]
  /** Links back (start page, dashboard, …). */
  children: React.ReactNode
  className?: string
}) {
  return (
    <main
      className={cn(
        "mx-auto flex w-full max-w-content flex-1 flex-col items-start justify-center gap-6 px-[clamp(20px,3.2vw,52px)] py-15",
        className,
      )}
    >
      <p className="font-mono text-xs tracking-[0.06em] text-hot uppercase">{copy.code}</p>
      <h1 className="text-[clamp(25px,3vw,35px)] leading-[1.1] font-[560] tracking-[-0.04em] [font-stretch:84%]">
        {copy.title}
      </h1>
      <p className="max-w-[58ch] text-base leading-relaxed text-text-secondary">{copy.body}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </main>
  )
}
