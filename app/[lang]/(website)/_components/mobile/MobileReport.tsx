import { ArrowDownRight, Check } from 'lucide-react'
import { RichText } from '../rich-text'
import type { Landing } from '../types'

/** Quick Check results: one static example report card and the step to the Business Models. */
export function MobileReport({ t }: { t: Landing }) {
  const copy = t.quickCheck.results
  const report = copy.report

  return (
    <section className="m-section m-section--split" id="m-results" aria-labelledby="m-results-title">
      <div className="m-section__inner">
        <div className="m-section__copy" data-m-reveal>
          <p className="m-kicker">{copy.kicker}</p>
          <h2 className="m-title" id="m-results-title"><RichText text={copy.title} /></h2>
          <p className="m-body">{copy.body}</p>
          <a className="m-text-link m-story-link" href="#m-business-models">
            {copy.link}
            <ArrowDownRight size={17} strokeWidth={1.7} aria-hidden="true" />
          </a>
        </div>

        <figure className="m-report-stage" data-m-reveal>
          <div className="m-report">
            <div className="m-report__topline"><span>{report.topLeft}</span><span>{report.topRight}</span></div>
            <p className="m-report__kicker">{report.kicker}</p>
            <h3>{report.title}</h3>
            <div className="m-report__assessment">
              <span>{report.assessment}</span>
              <strong><Check size={18} strokeWidth={2} aria-hidden="true" />{report.result}</strong>
            </div>
            <ul className="m-report__factors">
              <li><span>{report.demand}</span><strong>{report.demandValue}</strong></li>
              <li><span>{report.source}</span><strong>{report.sourceValue}</strong></li>
              <li><span>{report.capex}</span><strong>{report.capexValue}</strong></li>
            </ul>
            <div className="m-report__reason">
              <span>{report.reasonLabel}</span>
              <p>{report.reason}</p>
            </div>
            <div className="m-report__footer"><span>{report.footerLeft}</span><span>{report.footerRight}</span></div>
          </div>
          <figcaption className="m-note">{copy.captionDocument}</figcaption>
        </figure>
      </div>
    </section>
  )
}
