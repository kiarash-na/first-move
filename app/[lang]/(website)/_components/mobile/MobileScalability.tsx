import { RichText } from '../rich-text'
import type { Landing } from '../types'

/** Scalability and replicability: the three items as a ledger. */
export function MobileScalability({ t }: { t: Landing }) {
  const copy = t.businessModels.scalability

  return (
    <section className="m-section" id="m-scalability" aria-labelledby="m-scalability-title">
      <div className="m-section__inner">
        <div className="m-section__copy" data-m-reveal>
          <p className="m-kicker">{copy.kicker}</p>
          <h2 className="m-title" id="m-scalability-title"><RichText text={copy.title} /></h2>
          <p className="m-body">{copy.body}</p>
        </div>
        <div className="m-ledger" data-m-reveal>
          {copy.items.map((item) => (
            <div key={item.label}>
              <span className="m-label">{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
