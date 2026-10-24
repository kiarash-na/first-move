import Link from "next/link"

import { cn } from "@/lib/utils"

/**
 * One entry of the docs navigation; the current page carries `aria-current="page"`. It prefetches
 * the whole page (every docs page is fully static), so switching pages shows the content at once.
 */
export function DocsNavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      prefetch={true}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-11 items-center border-l-2 pl-3 transition-colors duration-[180ms]",
        active ? "border-foreground text-foreground" : "border-transparent text-text-secondary hover:text-cool",
      )}
    >
      {label}
    </Link>
  )
}
