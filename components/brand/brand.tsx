import Link from "next/link"

import { cn } from "@/lib/utils"

/** The First Move mark and name (DESIGN-TOKENS §3 brand name), linking to the landing page. */
export function Brand({
  href,
  name,
  label,
  className,
}: {
  href: string
  name: string
  /** Accessible name of the link. */
  label: string
  className?: string
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn("inline-flex min-h-11 items-center gap-2.5 text-foreground", className)}
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="size-7 fill-none stroke-primary stroke-[1.8]"
      >
        <path d="M4 23.5 15.9 16 28 23.5" />
        <path d="M4 15.5 15.9 8 28 15.5" />
        <path d="M15.9 8v8" className="stroke-hot" />
      </svg>
      <span className="text-xl leading-none font-[755] tracking-[-0.045em] [font-stretch:82%]">
        {name}
      </span>
    </Link>
  )
}
