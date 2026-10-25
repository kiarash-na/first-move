import Link from 'next/link'
import { ArrowUp } from 'lucide-react'
import { LegalLinks } from '@/components/site-footer/legal-links'
import { docHref } from '@/lib/docs/pages'
import { withLocale } from '@/lib/i18n/locale-path'
import { REPOSITORY } from '@/lib/legal/operator'
import type { LandingCopyProps } from '../types'

/** The footer: brand, open source, the four links, back to top, the legal links, the presentation and the source. */
export function MobileFooter({ t, lang }: LandingCopyProps) {
  const copy = t.closing.footer

  return (
    <footer className="m-footer">
      <a className="m-footer__brand" href="#m-overview">
        {copy.brandName} <span>{copy.brandTag}</span>
        <span className="sr-only">, {copy.brandBack}</span>
      </a>
      <p className="m-footer__open"><i aria-hidden="true" />{copy.openSource}</p>
      {/* The two modules lead to their docs pages, not to the dashboard (D-LP-3); the docs index closes the row. */}
      <nav className="m-footer__nav" aria-label={copy.nav}>
        <Link href={docHref(lang, 'quick-check')} prefetch={false}>{copy.quickCheck}</Link>
        <Link href={docHref(lang, 'business-plan')} prefetch={false}>{copy.businessModels}</Link>
        <a href="#m-methodology">{copy.methodology}</a>
        <Link href={docHref(lang, 'index')} prefetch={false}>{copy.docs}</Link>
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
        extra={[
          { label: t.presentation.footer, href: withLocale('/presentation', lang) },
          { label: copy.legal.source, href: REPOSITORY.url },
        ]}
      />
    </footer>
  )
}
