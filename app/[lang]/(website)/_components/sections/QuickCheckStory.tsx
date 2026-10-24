'use client'

import { useState, type CSSProperties, type PointerEvent } from 'react'
import { ArrowDownRight, Check, FileText, Monitor, ScanSearch, X } from 'lucide-react'

interface QuickCheckStoryProps {
  onPreviewChange: (demand: number, source: number) => void
}

type ParameterKey = 'demand' | 'source' | 'capex'
type AssessmentId = 'promising' | 'further' | 'not-promising'

const parameters: { id: ParameterKey; label: string; note: string }[] = [
  { id: 'demand', label: 'Heat demand density', note: 'Concentration of demand across the project area' },
  { id: 'source', label: 'Local heat source availability', note: 'Potential access to local renewables or waste heat' },
  { id: 'capex', label: 'Investment costs', note: 'Early investment assumption for the screening boundary' },
]

const scenarios = [
  { id: 'urban', label: 'Dense neighbourhood', values: { demand: 84, source: 62, capex: 58 } },
  { id: 'waste', label: 'Waste-heat site', values: { demand: 68, source: 90, capex: 54 } },
  { id: 'rural', label: 'Low-density area', values: { demand: 32, source: 58, capex: 74 } },
]

const assessments = [
  {
    id: 'promising' as const,
    label: 'Promising',
    icon: Check,
    summary: 'The first screen finds strong supporting conditions.',
    reasons: [
      ['Technical', 'High heat demand density across the project area.'],
      ['Source', 'A suitable local heat source is available.'],
      ['Economic', 'Investment costs fall within the predefined range.'],
    ],
  },
  {
    id: 'further' as const,
    label: 'Further analysis required',
    icon: ScanSearch,
    summary: 'The result is sensitive to assumptions that need a closer look.',
    reasons: [
      ['Technical', 'Network conditions need more detailed investigation.'],
      ['Source', 'Availability, temperature or timing must be confirmed.'],
      ['Economic', 'Key cost or connection assumptions remain uncertain.'],
    ],
  },
  {
    id: 'not-promising' as const,
    label: 'Not promising',
    icon: X,
    summary: 'The current combination does not support a positive first screen.',
    reasons: [
      ['Technical', 'Demand conditions weaken the initial network case.'],
      ['Source', 'No sufficiently suitable local source is identified.'],
      ['Economic', 'Investment assumptions sit outside the screening range.'],
    ],
  },
]

function levelText(value: number) {
  if (value >= 67) return 'High'
  if (value >= 34) return 'Medium'
  return 'Low'
}

export function QuickCheckStory({ onPreviewChange }: QuickCheckStoryProps) {
  const [values, setValues] = useState({ demand: 78, source: 72, capex: 46 })
  const [scenario, setScenario] = useState('urban')
  const [assessment, setAssessment] = useState<AssessmentId>('promising')
  const [reportMode, setReportMode] = useState<'online' | 'document'>('online')

  const updateValues = (next: typeof values) => {
    setValues(next)
    onPreviewChange(next.demand, next.source)
  }

  const activeAssessment = assessments.find((item) => item.id === assessment) ?? assessments[0]
  const AssessmentIcon = activeAssessment.icon

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
            <p className="section-kicker">Quick Check · Inputs</p>
            <h2 className="section-title" id="quick-inputs-title">Start with<br />the area.<br /><em>See what matters.</em></h2>
            <p className="section-body">
              A focused set of project parameters creates a fast initial screen—without pretending
              to replace a full feasibility study. Switch scenarios or adjust the illustrative inputs.
            </p>
            <div className="scenario-switcher" aria-label="Predefined scenario previews">
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
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="parameter-console" data-reveal>
            <div className="console-heading">
              <span>Project input signature</span>
              <span>Interactive preview</span>
            </div>
            {parameters.map((parameter) => {
              const value = values[parameter.id]
              const style = { '--range-progress': `${value}%` } as CSSProperties
              return (
                <div className="parameter-control" key={parameter.id}>
                  <label htmlFor={`parameter-${parameter.id}`}>
                    <span>{parameter.label}</span>
                    <strong>{levelText(value)}</strong>
                  </label>
                  <p>{parameter.note}</p>
                  <input
                    id={`parameter-${parameter.id}`}
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={value}
                    aria-valuetext={levelText(value)}
                    style={style}
                    onChange={(event) => {
                      setScenario('custom')
                      updateValues({ ...values, [parameter.id]: Number(event.target.value) })
                    }}
                  />
                  <div className="parameter-limits" aria-hidden="true"><span>Low</span><span>High</span></div>
                </div>
              )
            })}
            <p className="preview-note">Illustrative inputs only · no assessment is calculated in this landing-page preview.</p>
          </div>
        </div>
      </section>

      <section className="story-section assessment-section" id="quick-assessment" data-chapter aria-labelledby="assessment-title">
        <div className="story-section__inner">
          <div className="section-copy section-copy--wide" data-reveal>
            <p className="section-kicker">Quick Check · Overall assessment</p>
            <h2 className="section-title" id="assessment-title">A clear answer.<br /><em>And the reasons why.</em></h2>
            <p className="section-body">
              The three-level result is only the headline. Decisive technical and economic factors
              remain attached to it, so the outcome can be discussed and challenged.
            </p>
          </div>

          <div className="assessment-workbench" data-reveal>
            <div className="assessment-scale" role="group" aria-label="Example assessment states">
              {assessments.map((item, index) => {
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
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>

            <div className={`assessment-result assessment-result--${activeAssessment.id}`} aria-live="polite">
              <div className="assessment-result__headline">
                <AssessmentIcon size={35} strokeWidth={1.35} aria-hidden="true" />
                <div>
                  <span>Example overall assessment</span>
                  <h3>{activeAssessment.label}</h3>
                </div>
              </div>
              <p>{activeAssessment.summary}</p>
              <div className="assessment-reasons">
                {activeAssessment.reasons.map(([label, reason]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <p>{reason}</p>
                  </div>
                ))}
              </div>
              <p className="preview-note">Illustrative output state · actual results depend on project inputs and the calculation methodology.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="story-section results-section" id="quick-results" data-chapter aria-labelledby="results-title">
        <div className="story-section__inner split-layout split-layout--reverse">
          <div className="section-copy" data-reveal>
            <p className="section-kicker">Quick Check · Results &amp; output</p>
            <h2 className="section-title" id="results-title">Clear enough<br />to discuss.<br /><em>Ready to export.</em></h2>
            <p className="section-body">
              Key results become a visual project output with the overall assessment and its reasoning.
              The same result can take the form of an online view, PDF or another output document.
            </p>
            <div className="output-modes" role="group" aria-label="Report preview format">
              <button type="button" aria-pressed={reportMode === 'online'} onClick={() => setReportMode('online')}>
                <Monitor size={17} strokeWidth={1.6} aria-hidden="true" />Online view
              </button>
              <button type="button" aria-pressed={reportMode === 'document'} onClick={() => setReportMode('document')}>
                <FileText size={17} strokeWidth={1.6} aria-hidden="true" />PDF page
              </button>
            </div>
            <a className="text-link story-link" href="#business-use-cases">
              Continue to Business Models
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
                <span>5GDHC / QUICK CHECK</span>
                <span>EXAMPLE OUTPUT</span>
              </div>
              <div className="report-title-row">
                <div>
                  <span>Project screening</span>
                  <h3>Network potential</h3>
                </div>
                <ScanSearch size={30} strokeWidth={1.25} aria-hidden="true" />
              </div>
              <div className="report-assessment">
                <span>Overall assessment</span>
                <strong><Check size={20} strokeWidth={1.8} aria-hidden="true" />Promising</strong>
                <div className="report-three-level" aria-hidden="true"><i /><i /><i /></div>
              </div>
              <div className="report-factors">
                <div><span>Heat demand density</span><strong>High</strong><i className="factor-line factor-line--long" /></div>
                <div><span>Local heat source</span><strong>Available</strong><i className="factor-line factor-line--medium" /></div>
                <div><span>Investment costs</span><strong>Within range</strong><i className="factor-line factor-line--short" /></div>
              </div>
              <div className="report-reason">
                <span>Why this result</span>
                <p>High demand density, a suitable local source and investment costs within the predefined range.</p>
              </div>
              <div className="report-footer"><span>SCREENING · NOT A FULL FEASIBILITY STUDY</span><span>01 / 01</span></div>
            </div>
            <p className="report-caption">{reportMode === 'online' ? 'Online output composition' : 'Document output composition'} · example content</p>
          </div>
        </div>
      </section>
    </>
  )
}
