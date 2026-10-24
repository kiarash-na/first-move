import { docHref, visibleDocs, type DocSlug } from "@/lib/docs/pages"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import type { Locale } from "@/lib/i18n/locales"
import { DocsNavLink } from "./docs-nav-link"

/** The list of docs pages next to the article (above it on small screens); the AI pages only while live. */
export function DocsNav({ lang, current, copy, live }: { lang: Locale; current: DocSlug; copy: Dictionary<"docs">; live: boolean }) {
  return (
    <nav aria-label={copy.nav.label} className="lg:sticky lg:top-6 lg:self-start">
      <p className="mb-3 font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">{copy.nav.title}</p>
      <ul className="flex flex-col text-sm">
        {visibleDocs(live).map((slug) => (
          <li key={slug}>
            <DocsNavLink href={docHref(lang, slug)} label={copy.pages[slug].title} active={slug === current} />
          </li>
        ))}
      </ul>
    </nav>
  )
}
