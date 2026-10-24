'use client'

import { useState, type CSSProperties, type PointerEvent } from 'react'
import { ArrowDownRight, Check, FileText, Monitor, ScanSearch, X } from 'lucide-react'
import { RichText } from '../rich-text'
import type { Landing } from '../types'

interface QuickCheckStoryProps {
  t: Landing
  onPreviewChange: (demand: number, source: number) => void
}

type ParameterKey = 'demand' | 'source' | 'capex'
type AssessmentId = 'promising' | 'further' | 'not-promising'

const parameterIds: ParameterKey[] = ['demand', 'source', 'capex']

const scenarios = [
  { id: 'urban', values: { demand: 84, source: 62, capex: 58 } },
  { id: 'waste', values: { demand: 68, source: 90, capex: 54 } },
  { id: 'rural', values: { demand: 32, source: 58, capex: 74 } },
] as const

const assessmentMeta = [
  { id: 'promising', key: 'promising', icon: Check },
  { id: 'further', key: 'further', icon: ScanSearch },
  { id: 'not-promising', key: 'notPromising', icon: X },
] as const

function levelKey(value: number) {
  if (value >= 67) return 'high'
  if (value >= 34) return 'medium'
  return 'low'
}

export function QuickCheckStory({ t, onPreviewChange }: QuickCheckStoryProps) {
  const [values, setValues] = useState({ demand: 78, source: 72, capex: 46 })
  const [scenario, setScenario] = useState('urban')
  const [assessment, setAssessment] = useState<AssessmentId>('promising')
  const [reportMode, setReportMode] = useState<'online' | 'document'>('online')

  const updateValues = (next: typeof values) => {
    setValues(next)
    onPreviewChange(next.demand, next.source)
  }

  const { inputs, assessment: assessmentCopy, results } = t.quickCheck
  const levelText = (value: number) => inputs[levelKey(value)]
  const activeMeta = assessmentMeta.find((item) => item.id === assessment) ?? assessmentMeta[0]
  const activeState = assessmentCopy.states[activeMeta.key]
  const AssessmentIcon = activeMeta.icon

  const tiltReport = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    event.currentTarget.style.setProperty('--report-ry', `${x * 7}deg`)
    event.currentTarget.style.setProperty('--report-rx', `${y * -6}deg`)
  }

  const resetReportTilt = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--report-ry', '0deg')
    event.currentTarget.style.setProperty('--report-rx', '0deg')
  }

  return (
    <>
      <section className="story-section quick-inputs-section" id="quick-inputs" data-chapter aria-labelledby="quick-inputs-title">
        <div className="story-section__inner split-layout">
          <div className="section-copy" data-reveal>
            <p className="section-kicker">{inputs.kicker}</p>
            <h2 className="section-title" id="quick-inputs-title"><RichText text={inputs.title} /></h2>
            <p className="section-body">{inputs.body}</p>
            <div className="scenario-switcher" aria-label={inputs.scenariosLabel}>
              {scenarios.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={scenario === item.id}
                  onClick={() => {
                    setScenario(item.id)
                    updateValues({ ...item.values })
                  }}
                >
                  {inputs.scenarios[item.id]}
                </button>
              ))}
            </div>
          </div>

          <div className="parameter-console" data-reveal>
            <div className="console-heading">
              <span>{inputs.consoleTitle}</span>
              <span>{inputs.consoleTag}</span>
            </div>
            {parameterIds.map((id) => {
              const parameter = inputs.parameters[id]
              const value = values[id]
              const style = { '--range-progress': `${value}%` } as CSSProperties
              return (
                <div className="parameter-control" key={id}>
                  <label htmlFor={`parameter-${id}`}>
                    <span>{parameter.label}</span>
                    <strong>{levelText(value)}</strong>
                  </label>
                  <p>{parameter.note}</p>
                  <input
                    id={`parameter-${id}`}
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={value}
                    aria-valuetext={levelText(value)}
                    style={style}
                    onChange={(event) => {
                      setScenario('custom')
                      updateValues({ ...values, [id]: Number(event.target.value) })
                    }}
                  />
                  <div className="parameter-limits" aria-hidden="true"><span>{inputs.low}</span><span>{inputs.high}</span></div>
                </div>
              )
            })}
            <p className="preview-note">{inputs.note}</p>
          </div>
        </div>
      </section>

      <section className="story-section assessment-section" id="quick-assessment" data-chapter aria-labelledby="assessment-title">
        <div className="story-section__inner">
          <div className="section-copy section-copy--wide" data-reveal>
            <p className="section-kicker">{assessmentCopy.kicker}</p>
            <h2 className="section-title" id="assessment-title"><RichText text={assessmentCopy.title} /></h2>
            <p className="section-body">{assessmentCopy.body}</p>
          </div>

          <div className="assessment-workbench" data-reveal>
            <div className="assessment-scale" role="group" aria-label={assessmentCopy.scaleLabel}>
              {assessmentMeta.map((item, index) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`assessment-step assessment-step--${item.id}`}
                    aria-pressed={assessment === item.id}
                    onClick={() => setAssessment(item.id)}
                  >
                    <span className="assessment-step__index">0{index + 1}</span>
                    <Icon size={21} strokeWidth={1.6} aria-hidden="true" />
                    <span>{assessmentCopy.states[item.key].label}</span>
                  </button>
                )
              })}
            </div>

            <div className={`assessment-result assessment-result--${activeMeta.id}`} aria-live="polite">
              <div className="assessment-result__headline">
                <AssessmentIcon size={35} strokeWidth={1.35} aria-hidden="true" />
                <div>
                  <span>{assessmentCopy.resultLabel}</span>
                  <h3>{activeState.label}</h3>
                </div>
              </div>
              <p>{activeState.summary}</p>
              <div className="assessment-reasons">
                {(['technical', 'source', 'economic'] as const).map((factor) => (
                  <div key={factor}>
                    <span>{assessmentCopy[factor]}</span>
                    <p>{activeState[factor]}</p>
                  </div>
                ))}
              </div>
              <p className="preview-note">{assessmentCopy.note}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="story-section results-section" id="quick-results" data-chapter aria-labelledby="results-title">
        <div className="story-section__inner split-layout split-layout--reverse">
          <div className="section-copy" data-reveal>
            <p className="section-kicker">{results.kicker}</p>
            <h2 className="section-title" id="results-title"><RichText text={results.title} /></h2>
            <p className="section-body">{results.body}</p>
            <div className="output-modes" role="group" aria-label={results.modesLabel}>
              <button type="button" aria-pressed={reportMode === 'online'} onClick={() => setReportMode('online')}>
                <Monitor size={17} strokeWidth={1.6} aria-hidden="true" />{results.online}
              </button>
              <button type="button" aria-pressed={reportMode === 'document'} onClick={() => setReportMode('document')}>
                <FileText size={17} strokeWidth={1.6} aria-hidden="true" />{results.document}
              </button>
            </div>
            <a className="text-link story-link" href="#business-use-cases">
              {results.link}
              <ArrowDownRight size={17} strokeWidth={1.7} aria-hidden="true" />
            </a>
          </div>

          <div
            className={`report-stage report-stage--${reportMode}`}
            data-reveal
            onPointerMove={tiltReport}
            onPointerLeave={resetReportTilt}
          >
            <div className="report-object">
              <div className="report-topline">
                <span>{results.report.topLeft}</span>
                <span>{results.report.topRight}</span>
              </div>
              <div className="report-title-row">
                <div>
                  <span>{results.report.kicker}</span>
                  <h3>{results.report.title}</h3>
                </div>
                <ScanSearch size={30} strokeWidth={1.25} aria-hidden="true" />
              </div>
              <div className="report-assessment">
                <span>{results.report.assessment}</span>
                <strong><Check size={20} strokeWidth={1.8} aria-hidden="true" />{results.report.result}</strong>
                <div className="report-three-level" aria-hidden="true"><i /><i /><i /></div>
              </div>
              <div className="report-factors">
                <div><span>{results.report.demand}</span><strong>{results.report.demandValue}</strong><i className="factor-line factor-line--long" /></div>
                <div><span>{results.report.source}</span><strong>{results.report.sourceValue}</strong><i className="factor-line factor-line--medium" /></div>
                <div><span>{results.report.capex}</span><strong>{results.report.capexValue}</strong><i className="factor-line factor-line--short" /></div>
              </div>
              <div className="report-reason">
                <span>{results.report.reasonLabel}</span>
                <p>{results.report.reason}</p>
              </div>
              <div className="report-footer"><span>{results.report.footerLeft}</span><span>{results.report.footerRight}</span></div>
            </div>
            <p className="report-caption">{reportMode === 'online' ? results.captionOnline : results.captionDocument}</p>
          </div>
        </div>
      </section>
    </>
  )
}
