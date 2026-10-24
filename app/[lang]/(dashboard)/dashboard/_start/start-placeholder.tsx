import Link from "next/link"
import { ArrowUpRightIcon } from "lucide-react"

import { AppHeader } from "@/components/app-header/app-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import type { Locale } from "@/lib/i18n/locales"

/** Phase 01 placeholder for `/[lang]/dashboard`; replaced by the start screen in phase 07. */
export function StartPlaceholder({
  lang,
  common,
  copy,
}: {
  lang: Locale
  common: Dictionary<"common">
  copy: Dictionary<"start">["placeholder"]
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader lang={lang} common={common} />
      <main className="mx-auto flex w-full max-w-content flex-1 items-start px-[clamp(20px,3.2vw,52px)] py-12 sm:py-15">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <p className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">{copy.eyebrow}</p>
            <CardTitle className="text-[clamp(25px,3vw,35px)]">
              <h1>{copy.title}</h1>
            </CardTitle>
            <CardDescription className="max-w-[58ch] text-base text-text-secondary">{copy.body}</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge>{copy.status}</Badge>
          </CardContent>
          <CardFooter>
            <Button asChild variant="secondary">
              <Link href={`/${lang}`}>
                {copy.website}
                <ArrowUpRightIcon strokeWidth={1.6} aria-hidden="true" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
