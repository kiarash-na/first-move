import { ArrowDownRight } from 'lucide-react'
import { RichText } from '../rich-text'
import type { Landing } from '../types'

/** "The System": the promise and the three audiences. */
export function MobilePromise({ t }: { t: Landing }) {
  const { promise, audiences } = t.product

  return (
    <section className="m-section" id="m-system" aria-labelledby="m-promise-title">
      <div className="m-section__inner">
        <div className="m-section__copy" data-m-reveal>
          <p className="m-kicker">{promise.kicker}</p>
          <h2 className="m-title" id="m-promise-title"><RichText text={promise.title} /></h2>
          <p className="m-body">{promise.body}</p>
          <a className="m-text-link m-story-link" href="#m-tools">
            {promise.link}
            <ArrowDownRight size={17} strokeWidth={1.7} aria-hidden="true" />
          </a>
        </div>
        <div className="m-audiences" data-m-reveal>
          {audiences.map((audience) => (
            <div key={audience.title}>
              <h3>{audience.title}</h3>
              <p>{audience.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
