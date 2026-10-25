import Link from 'next/link'
import { ArrowUp } from 'lucide-react'
import { LegalLinks } from '@/components/site-footer/legal-links'
import { withLocale } from '@/lib/i18n/locale-path'
import { REPOSITORY } from '@/lib/legal/operator'
import type { LandingCopyProps } from '../types'

/** The footer: brand, open source, the three links, back to top and the legal links. */
export function MobileFooter({ t, lang }: LandingCopyProps) {
  const copy = t.closing.footer
  const dashboard = withLocale('/dashboard', lang)

  return (
    <footer className="m-footer">
      <a className="m-footer__brand" href="#m-overview">
        {copy.brandName} <span>{copy.brandTag}</span>
        <span className="sr-only">, {copy.brandBack}</span>
      </a>
      <p className="m-footer__open"><i aria-hidden="true" />{copy.openSource}</p>
      <nav className="m-footer__nav" aria-label={copy.nav}>
        <Link href={dashboard}>{copy.quickCheck}</Link>
        <Link href={dashboard}>{copy.businessModels}</Link>
        <a href="#m-methodology">{copy.methodology}</a>
      </nav>
      <a className="m-footer__top" href="#m-overview">
        {copy.backToTop}
        <ArrowUp size={15} strokeWidth={1.6} aria-hidden="true" />
      </a>
      <LegalLinks
        className="m-footer__legal"
        lang={lang}
        labels={copy.legal}
        navLabel={copy.legal.nav}
        extra={{ label: copy.legal.source, href: REPOSITORY.url }}
      />
    </footer>
  )
}
