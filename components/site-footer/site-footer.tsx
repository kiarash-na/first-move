import type { Dictionary } from "@/lib/i18n/dictionaries"
import { withLocale } from "@/lib/i18n/locale-path"
import type { Locale } from "@/lib/i18n/locales"
import { interpolate } from "@/lib/legal/interpolate"
import { REPOSITORY } from "@/lib/legal/operator"
import { LegalLinks } from "./legal-links"

/** Footer of the public pages: copyright and licence line, the legal links, the docs, the presentation and the source code. */
export function SiteFooter({ lang, copy }: { lang: Locale; copy: Dictionary<"legal"> }) {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-content flex-col gap-3 px-[clamp(20px,3.2vw,52px)] pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <p className="font-mono text-xs tracking-[0.06em] text-text-secondary uppercase">
          {interpolate(copy.footer.copyright, lang)} · {interpolate(copy.footer.licensed, lang)}
        </p>
        <LegalLinks
          lang={lang}
          labels={copy.docs}
          navLabel={copy.footer.nav}
          linkClassName="font-mono text-xs text-text-secondary"
          extra={[
            { label: copy.documentation, href: withLocale("/docs", lang) },
            { label: copy.presentation, href: withLocale("/presentation", lang) },
            { label: copy.footer.source, href: REPOSITORY.url },
          ]}
        />
      </div>
    </footer>
  )
}
