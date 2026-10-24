import Link from 'next/link'
import { ArrowUp, ArrowUpRight, Check } from 'lucide-react'
import { LegalLinks } from '@/components/site-footer/legal-links'
import { withLocale } from '@/lib/i18n/locale-path'
import { REPOSITORY } from '@/lib/legal/operator'
import { RichText } from '../rich-text'
import type { LandingCopyProps } from '../types'

export function Closing({ t, lang }: LandingCopyProps) {
  const { methodology, getStarted, footer } = t.closing
  const dashboard = withLocale('/dashboard', lang)

  return (
    <>
      <section className="methodology-section" id="methodology" data-chapter aria-labelledby="methodology-title">
        <div className="methodology-section__inner">
          <div className="methodology-heading" data-reveal>
            <p className="section-kicker">{methodology.kicker}</p>
            <h2 className="section-title" id="methodology-title"><RichText text={methodology.title} /></h2>
            <p className="section-body">{methodology.body}</p>
          </div>

          <div className="methodology-ledger" data-reveal>
            {methodology.rows.map((row) => (
              <article key={row.title}>
                <Check size={20} strokeWidth={1.6} aria-hidden="true" />
                <h3>{row.title}</h3>
                <p>{row.text}</p>
              </article>
            ))}
          </div>

          <div className="screening-boundary" data-reveal>
            <span>{methodology.boundaryLabel}</span>
            <p>{methodology.boundaryLead} <strong>{methodology.boundaryStrong}</strong></p>
          </div>
        </div>
      </section>

      <section className="get-started-section" id="get-started" data-chapter aria-labelledby="get-started-title">
        <div className="get-started-section__inner" data-reveal>
          <p className="section-kicker">{getStarted.kicker}</p>
          <h2 id="get-started-title"><RichText text={getStarted.title} /></h2>
          <p>{getStarted.body}</p>
          <div className="get-started-actions">
            <Link className="primary-action" href={dashboard}>{getStarted.primary}<ArrowUpRight size={23} strokeWidth={1.5} aria-hidden="true" /></Link>
            <a className="text-link" href="#business-use-cases">{getStarted.secondary}<ArrowUpRight size={17} strokeWidth={1.6} aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <a className="footer-brand" href="#overview" aria-label={footer.brandLabel}>{footer.brandName} <span>{footer.brandTag}</span></a>
        <p><i aria-hidden="true" />{footer.openSource}</p>
        <nav aria-label={footer.nav}>
          <Link href={dashboard}>{footer.quickCheck}</Link>
          <Link href={dashboard}>{footer.businessModels}</Link>
          <a href="#methodology">{footer.methodology}</a>
        </nav>
        <a className="back-to-top" href="#overview">{footer.backToTop}<ArrowUp size={15} strokeWidth={1.6} aria-hidden="true" /></a>
        <LegalLinks
          className="footer-legal"
          lang={lang}
          labels={footer.legal}
          navLabel={footer.legal.nav}
          extra={{ label: footer.legal.source, href: REPOSITORY.url }}
        />
      </footer>
    </>
  )
}
