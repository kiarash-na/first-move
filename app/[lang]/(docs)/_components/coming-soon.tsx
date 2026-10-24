import Link from "next/link"
import { ArrowUpRightIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import type { Locale } from "@/lib/i18n/locales"

/** Docs placeholder until the MDX content exists (D-22). */
export function ComingSoon({ lang, copy }: { lang: Locale; copy: Dictionary<"common">["docs"] }) {
  return (
    <main className="mx-auto flex w-full max-w-content flex-1 flex-col items-start gap-6 px-[clamp(20px,3.2vw,52px)] py-12 sm:py-15">
      <p className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">{copy.eyebrow}</p>
      <h1 className="max-w-[20ch] text-[clamp(25px,3vw,35px)] leading-[1.1] font-[560] tracking-[-0.04em] [font-stretch:84%]">
        {copy.title}
      </h1>
      <p className="max-w-[58ch] text-base leading-relaxed text-text-secondary">{copy.body}</p>
      <Badge variant="outline">{copy.status}</Badge>
      <Button asChild variant="secondary">
        <Link href={`/${lang}/dashboard`}>
          {copy.dashboard}
          <ArrowUpRightIcon strokeWidth={1.6} aria-hidden="true" />
        </Link>
      </Button>
    </main>
  )
}
