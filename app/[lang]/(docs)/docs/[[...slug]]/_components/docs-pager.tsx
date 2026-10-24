import Link from "next/link"

import { cn } from "@/lib/utils"
import { docHref, docNeighbours, type DocSlug } from "@/lib/docs/pages"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import type { Locale } from "@/lib/i18n/locales"

const LINK = "flex min-h-11 flex-col justify-center gap-1 border px-4 py-3 transition-colors duration-[180ms] hover:border-foreground"

/** Links to the previous and the next visible page, below the article. */
export function DocsPager({ lang, slug, copy, live }: { lang: Locale; slug: DocSlug; copy: Dictionary<"docs">; live: boolean }) {
  const { previous, next } = docNeighbours(slug, live)
  if (!previous && !next) return null

  return (
    <nav aria-label={copy.pager.label} className="grid gap-3 border-t pt-8 sm:grid-cols-2">
      {previous ? (
        <Link href={docHref(lang, previous)} prefetch={true} rel="prev" className={LINK}>
          <span className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">{copy.pager.previous}</span>{" "}
          <span className="text-base text-foreground">{copy.pages[previous].title}</span>
        </Link>
      ) : null}
      {next ? (
        <Link href={docHref(lang, next)} prefetch={true} rel="next" className={cn(LINK, "sm:col-start-2 sm:items-end sm:text-right")}>
          <span className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">{copy.pager.next}</span>{" "}
          <span className="text-base text-foreground">{copy.pages[next].title}</span>
        </Link>
      ) : null}
    </nav>
  )
}
