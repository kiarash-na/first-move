import { ChevronDown, ShieldAlert } from 'lucide-react'
import { RichText } from '../rich-text'
import type { Landing } from '../types'

const RISKS = ['connection', 'source', 'finance'] as const

/** The Reality Check: the three risks as native details, the first open, and the rule that matters. */
export function MobileRealityCheck({ t }: { t: Landing }) {
  const copy = t.businessModels.reality

  return (
    <section className="m-section m-section--split" id="m-reality-check" aria-labelledby="m-reality-title">
      <div className="m-section__inner">
        <div className="m-section__copy" data-m-reveal>
          <p className="m-kicker m-kicker--hot">{copy.kicker}</p>
          <h2 className="m-title" id="m-reality-title"><RichText text={copy.title} /></h2>
          <p className="m-body">{copy.body}</p>
        </div>

        <div className="m-panel m-panel--hot" data-m-reveal>
          <div className="m-panel__head">
            <span className="m-panel__icon-title"><ShieldAlert size={18} strokeWidth={1.6} aria-hidden="true" />{copy.consoleTitle}</span>
            <span>{copy.consoleTag}</span>
          </div>
          <div className="m-panel__body">
            <div className="m-risks">
              {RISKS.map((id, index) => {
                const risk = copy.risks[id]
                return (
                  <details className="m-risk" key={id} open={index === 0}>
                    <summary>
                      <span><small>{risk.assumption}</small>{risk.title}</span>
                      <ChevronDown size={20} strokeWidth={1.5} aria-hidden="true" />
                    </summary>
                    <p>{risk.text}</p>
                  </details>
                )
              })}
            </div>
            <div className="m-rule">
              <span className="m-label m-label--hot">{copy.ruleLabel}</span>
              <p>{copy.rule}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
