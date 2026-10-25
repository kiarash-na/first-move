import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { withLocale } from '@/lib/i18n/locale-path'
import { RichText } from '../rich-text'
import type { LandingCopyProps } from '../types'

/** The closing call to action: the dashboard and the documentation. */
export function MobileGetStarted({ t, lang }: LandingCopyProps) {
  const copy = t.closing.getStarted

  return (
    <section className="m-section m-get-started" id="m-get-started" aria-labelledby="m-get-started-title">
      <div className="m-section__inner" data-m-reveal>
        <p className="m-kicker">{copy.kicker}</p>
        <h2 className="m-title" id="m-get-started-title"><RichText text={copy.title} /></h2>
        <p className="m-body">{copy.body}</p>
        <div className="m-get-started__actions">
          <Link className="m-primary" href={withLocale('/dashboard', lang)}>
            {copy.primary}
            <ArrowUpRight size={22} strokeWidth={1.5} aria-hidden="true" />
          </Link>
          <Link className="m-text-link" href={withLocale('/docs', lang)}>
            {copy.secondary}
            <ArrowUpRight size={17} strokeWidth={1.6} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
