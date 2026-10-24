import Link from "next/link"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import { BrandMark } from "./brand-mark"

/**
 * The First Move mark (D-68) and name (DESIGN-TOKENS §3 brand name), linking to the landing page.
 * Other link props and the ref pass through, so a tooltip can wrap it (the sidebar rail, D-59).
 */
export function Brand({
  href,
  name,
  label,
  prefetch,
  className,
  nameClassName,
  ...props
}: Omit<ComponentProps<typeof Link>, "href" | "prefetch" | "children" | "aria-label"> & {
  href: string
  name: string
  /** Accessible name of the link. */
  label: string
  /** Passed to `Link`; `false` where the landing page's own CSS should not be preloaded (the dashboard). */
  prefetch?: boolean
  className?: string
  /** Classes for the name, e.g. to hide it where only the mark shows. */
  nameClassName?: string
}) {
  return (
    <Link
      {...props}
      href={href}
      prefetch={prefetch}
      aria-label={label}
      className={cn("inline-flex min-h-11 items-center gap-2.5 text-foreground", className)}
    >
      <BrandMark className="size-7" />
      <span className={cn("text-xl leading-none font-[755] tracking-[-0.045em] [font-stretch:82%]", nameClassName)}>
        {name}
      </span>
    </Link>
  )
}
