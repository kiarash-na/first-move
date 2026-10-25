import { RichText } from '../rich-text'
import type { Landing } from '../types'

const ROLES = ['benefits', 'pays', 'owns', 'operates'] as const

/** The tailored Business Model Canvas: the six blocks and the four allocation roles as a list. */
export function MobileCanvas({ t }: { t: Landing }) {
  const copy = t.businessModels.canvas

  return (
    <section className="m-section" id="m-canvas" aria-labelledby="m-canvas-title">
      <div className="m-section__inner">
        <div className="m-section__copy" data-m-reveal>
          <p className="m-kicker m-kicker--hot">{copy.kicker}</p>
          <h2 className="m-title" id="m-canvas-title"><RichText text={copy.title} /></h2>
          <p className="m-body">{copy.body}</p>
        </div>

        <div className="m-canvas" data-m-reveal>
          {copy.blocks.map((block) => (
            <article key={block.title}>
              <h3>{block.title}</h3>
              <p>{block.text}</p>
            </article>
          ))}
        </div>

        <div className="m-allocation" data-m-reveal>
          <p className="m-label m-label--hot">{copy.allocationKicker}</p>
          <dl className="m-roles">
            {ROLES.map((role) => {
              const item = copy.roles[role]
              return (
                <div key={role}>
                  <dt>{item.label}</dt>
                  <dd>
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </dd>
                </div>
              )
            })}
          </dl>
        </div>
      </div>
    </section>
  )
}
