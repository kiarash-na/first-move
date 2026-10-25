'use client'

import { useState, type CSSProperties } from 'react'
import { RichText } from '../rich-text'
import type { Landing } from '../types'

type ParameterKey = 'demand' | 'source' | 'capex'

const PARAMETERS: readonly ParameterKey[] = ['demand', 'source', 'capex']

/** The same illustrative scenarios as the desktop's preview console. */
export const SCENARIOS = [
  { id: 'urban', values: { demand: 84, source: 62, capex: 58 } },
  { id: 'waste', values: { demand: 68, source: 90, capex: 54 } },
  { id: 'rural', values: { demand: 32, source: 58, capex: 74 } },
] as const

export type ScenarioId = (typeof SCENARIOS)[number]['id']

export function levelKey(value: number): 'low' | 'medium' | 'high' {
  if (value >= 67) return 'high'
  if (value >= 34) return 'medium'
  return 'low'
}

/** Quick Check inputs: three scenarios as buttons, three parameters as bars with their level word. */
export function MobileQuickInputs({ t }: { t: Landing }) {
  const copy = t.quickCheck.inputs
  const [scenario, setScenario] = useState<ScenarioId>('urban')
  const values = (SCENARIOS.find((item) => item.id === scenario) ?? SCENARIOS[0]).values

  return (
    <section className="m-section m-section--split" id="m-quick-check" aria-labelledby="m-quick-inputs-title">
      <div className="m-section__inner">
        <div className="m-section__copy" data-m-reveal>
          <p className="m-kicker">{copy.kicker}</p>
          <h2 className="m-title" id="m-quick-inputs-title"><RichText text={copy.title} /></h2>
          <p className="m-body">{copy.body}</p>
        </div>

        <div className="m-panel m-panel--cool" data-m-reveal>
          <div className="m-panel__head">
            <span>{copy.consoleTitle}</span>
            <span>{copy.consoleTag}</span>
          </div>
          <div className="m-panel__body">
            <div className="m-scenarios" role="group" aria-label={copy.scenariosLabel}>
              {SCENARIOS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="m-choice"
                  aria-pressed={scenario === item.id}
                  onClick={() => setScenario(item.id)}
                >
                  {copy.scenarios[item.id]}
                </button>
              ))}
            </div>

            <dl className="m-parameters">
              {PARAMETERS.map((id) => {
                const parameter = copy.parameters[id]
                const value = values[id]
                return (
                  <div className="m-parameter" key={id}>
                    <dt className="m-parameter__head">
                      <span>{parameter.label}</span>
                      <span className="m-parameter__level">{copy[levelKey(value)]}</span>
                    </dt>
                    <dd>
                      <p className="m-parameter__note">{parameter.note}</p>
                      <div className="m-bar" aria-hidden="true" style={{ '--value': `${value}%` } as CSSProperties}><i /></div>
                      <div className="m-bar__limits" aria-hidden="true"><span>{copy.low}</span><span>{copy.high}</span></div>
                    </dd>
                  </div>
                )
              })}
            </dl>
            <p className="m-note">{copy.note}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
