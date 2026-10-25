import { ArrowDownRight } from 'lucide-react'
import { RichText } from '../rich-text'
import type { Landing } from '../types'

/** The next-step implementation outline: four steps, then on to the AI Plan Score. */
export function MobileImplementation({ t }: { t: Landing }) {
  const copy = t.businessModels.implementation

  return (
    <section className="m-section m-section--split" id="m-implementation" aria-labelledby="m-implementation-title">
      <div className="m-section__inner">
        <div className="m-section__copy" data-m-reveal>
          <p className="m-kicker m-kicker--hot">{copy.kicker}</p>
          <h2 className="m-title" id="m-implementation-title"><RichText text={copy.title} /></h2>
          <p className="m-body">{copy.body}</p>
          <a className="m-text-link m-text-link--hot m-story-link" href="#m-ai-score">
            {copy.link}
            <ArrowDownRight size={17} strokeWidth={1.7} aria-hidden="true" />
          </a>
        </div>
        <ol className="m-steps" data-m-reveal>
          {copy.steps.map((step, index) => (
            <li key={step.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
