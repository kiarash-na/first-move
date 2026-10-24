import type * as React from "react"

import type { Dictionary } from "@/lib/i18n/dictionaries"
import { formatDate } from "@/lib/i18n/format"
import type { Locale } from "@/lib/i18n/locales"
import { DE_REVIEW_PENDING } from "@/lib/legal/review"
import type { LegalDocCopy } from "@/lib/legal/types"
import { InlineText } from "./inline-text"
import { LegalBlocks } from "./legal-blocks"

const NOTICE = "max-w-[68ch] border-l-2 border-hot bg-panel px-4 py-3 text-base leading-relaxed text-foreground"

/**
 * One legal document: title, version, optional notices, table of contents and numbered sections.
 * The text comes from the dictionary; `after` adds content (a table) behind a section by its id.
 */
export function LegalPage({
  doc,
  lang,
  legal,
  status,
  after,
}: {
  doc: LegalDocCopy
  lang: Locale
  legal: Dictionary<"legal">
  /** A status line under the title, e.g. whether the AI features are live. */
  status?: string
  after?: Readonly<Record<string, React.ReactNode>>
}) {
  const updated = formatDate(doc.updated, lang, { dateStyle: "medium", timeZone: "UTC" })

  return (
    <main className="mx-auto flex w-full max-w-content flex-1 flex-col gap-10 px-[clamp(20px,3.2vw,52px)] py-12 sm:py-15">
      <header className="flex flex-col items-start gap-5">
        <p className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">{legal.page.eyebrow}</p>
        <h1 className="max-w-[24ch] text-[clamp(25px,3vw,35px)] leading-[1.1] font-[560] tracking-[-0.04em] [font-stretch:84%]">
          {doc.title}
        </h1>
        <p className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">
          {legal.page.updated} {updated} · {legal.page.version} {doc.version}
        </p>
        {status ? <p role="note" className={NOTICE}>{status}</p> : null}
        {lang === "de" && DE_REVIEW_PENDING ? <p role="note" className={NOTICE}>{legal.page.reviewNotice}</p> : null}
        <p className="max-w-[68ch] text-lg leading-relaxed text-text-secondary">
          <InlineText text={doc.intro} lang={lang} />
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-16">
        <nav aria-label={legal.page.contents} className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-3 font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">{legal.page.contents}</p>
          <ol className="flex flex-col text-sm text-text-secondary">
            {doc.sections.map((section, index) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="inline-flex min-h-11 items-center gap-3 hover:text-cool">
                  <span aria-hidden="true" className="w-5 font-mono text-xs text-muted-foreground">{index + 1}</span>
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex min-w-0 flex-col gap-12">
          {doc.sections.map((section, index) => (
            // No accessible name on the section: a named section is a landmark, and a table in it carries its own
            // landmark name (the same words), which screen readers would announce twice (axe: landmark-unique).
            <section key={section.id} id={section.id} className="flex scroll-mt-6 flex-col gap-4">
              <h2 className="text-[25px] leading-[1.12] font-[560] tracking-[-0.04em] [font-stretch:84%]">
                <span aria-hidden="true" className="mr-3 font-mono text-sm font-normal tracking-normal text-muted-foreground">{index + 1}</span>
                {section.heading}
              </h2>
              <LegalBlocks body={section.body} lang={lang} label={section.heading} />
              {after?.[section.id]}
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
