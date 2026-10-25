import { Check } from 'lucide-react'
import { RichText } from '../rich-text'
import type { Landing } from '../types'
import { MobilePartners } from './MobilePartners'

/** Methodology and credibility: the five rows, the screening boundary and the partners. */
export function MobileMethodology({ t }: { t: Landing }) {
  const { methodology, partners } = t.closing

  return (
    <section className="m-section" id="m-methodology" aria-labelledby="m-methodology-title">
      <div className="m-section__inner">
        <div className="m-section__copy" data-m-reveal>
          <p className="m-kicker">{methodology.kicker}</p>
          <h2 className="m-title" id="m-methodology-title"><RichText text={methodology.title} /></h2>
          <p className="m-body">{methodology.body}</p>
        </div>

        <div className="m-rows" data-m-reveal>
          {methodology.rows.map((row) => (
            <article key={row.title}>
              <Check size={18} strokeWidth={1.8} aria-hidden="true" />
              <h3>{row.title}</h3>
              <p>{row.text}</p>
            </article>
          ))}
        </div>

        <div className="m-boundary" data-m-reveal>
          <span className="m-label">{methodology.boundaryLabel}</span>
          <p>{methodology.boundaryLead} <strong>{methodology.boundaryStrong}</strong></p>
        </div>

        <MobilePartners copy={partners} />
      </div>
    </section>
  )
}
