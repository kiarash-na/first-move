'use client'

import { useState } from 'react'
import { RichText } from '../rich-text'
import type { Landing } from '../types'

const USE_CASES = [
  { id: 'refurbishment', key: 'refurbishment' },
  { id: 'waste-heat', key: 'wasteHeat' },
  { id: 'rural', key: 'rural' },
] as const

type UseCaseId = (typeof USE_CASES)[number]['id']

/** Business Models use cases: a segmented control, the chosen case with its focus, the input categories. */
export function MobileUseCases({ t }: { t: Landing }) {
  const copy = t.businessModels.useCases
  const [selected, setSelected] = useState<UseCaseId>('refurbishment')
  const active = copy.items[(USE_CASES.find((item) => item.id === selected) ?? USE_CASES[0]).key]

  return (
    <section className="m-section m-section--split" id="m-business-models" aria-labelledby="m-use-cases-title">
      <div className="m-section__inner">
        <div className="m-section__copy" data-m-reveal>
          <p className="m-kicker m-kicker--hot">{copy.kicker}</p>
          <h2 className="m-title" id="m-use-cases-title"><RichText text={copy.title} /></h2>
        </div>

        <div className="m-panel m-panel--hot" data-m-reveal>
          <div className="m-panel__body">
            <div className="m-segments" role="group" aria-label={copy.groupLabel}>
              {USE_CASES.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className="m-choice m-choice--hot m-segment"
                  aria-pressed={selected === item.id}
                  onClick={() => setSelected(item.id)}
                >
                  <span className="m-segment__index" aria-hidden="true">0{index + 1}</span>
                  <span>{copy.items[item.key].shortTitle}</span>
                </button>
              ))}
            </div>

            <div className="m-use-case" aria-live="polite">
              <h3>{active.title}</h3>
              <p className="m-use-case__description">{active.description}</p>
              <p className="m-use-case__focus">{active.focus}</p>
            </div>

            <div className="m-inputs">
              <span className="m-inputs__label">{copy.inputsShort}</span>
              <ul aria-label={copy.inputsLabel}>
                {copy.inputs.map((input) => <li key={input}>{input}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
