'use client'

import { useState } from 'react'
import { Check, ScanSearch, X } from 'lucide-react'
import { RichText } from '../rich-text'
import type { Landing } from '../types'

const STATES = [
  { id: 'promising', key: 'promising', icon: Check },
  { id: 'further', key: 'further', icon: ScanSearch },
  { id: 'not-promising', key: 'notPromising', icon: X },
] as const

type StateId = (typeof STATES)[number]['id']

const FACTORS = ['technical', 'source', 'economic'] as const

/** Quick Check assessment: the three states as buttons, the chosen one with its summary and reasons. */
export function MobileAssessment({ t }: { t: Landing }) {
  const copy = t.quickCheck.assessment
  const [active, setActive] = useState<StateId>('promising')
  const meta = STATES.find((item) => item.id === active) ?? STATES[0]
  const state = copy.states[meta.key]
  const Icon = meta.icon

  return (
    <section className="m-section m-section--split" id="m-assessment" aria-labelledby="m-assessment-title">
      <div className="m-section__inner">
        <div className="m-section__copy" data-m-reveal>
          <p className="m-kicker">{copy.kicker}</p>
          <h2 className="m-title" id="m-assessment-title"><RichText text={copy.title} /></h2>
          <p className="m-body">{copy.body}</p>
        </div>

        <div className="m-stage" data-m-reveal>
          <div className="m-states" role="group" aria-label={copy.scaleLabel}>
            {STATES.map((item, index) => {
              const ItemIcon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`m-choice m-state m-state--${item.id}`}
                  aria-pressed={active === item.id}
                  onClick={() => setActive(item.id)}
                >
                  <span className="m-state__index">0{index + 1}</span>
                  <ItemIcon size={18} strokeWidth={1.7} aria-hidden="true" />
                  <span>{copy.states[item.key].label}</span>
                </button>
              )
            })}
          </div>

          <div className={`m-panel m-result m-result--${meta.id}`} aria-live="polite">
            <div className="m-panel__body">
              <div className="m-result__head">
                <Icon size={30} strokeWidth={1.4} aria-hidden="true" />
                <div>
                  <span className="m-label">{copy.resultLabel}</span>
                  <h3>{state.label}</h3>
                </div>
              </div>
              <p className="m-result__summary">{state.summary}</p>
              <ul className="m-reasons">
                {FACTORS.map((factor) => (
                  <li key={factor}>
                    <span className="m-label">{copy[factor]}</span>
                    <p>{state[factor]}</p>
                  </li>
                ))}
              </ul>
              <p className="m-note">{copy.note}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
