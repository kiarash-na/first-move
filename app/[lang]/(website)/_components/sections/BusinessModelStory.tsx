'use client'

import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight, ChevronDown, ShieldAlert } from 'lucide-react'
import { RichText } from '../rich-text'
import type { Landing } from '../types'

type UseCaseId = (typeof useCaseIds)[number]['id']
type RoleId = 'benefits' | 'pays' | 'owns' | 'operates'

const useCaseIds = [
  { id: 'refurbishment', key: 'refurbishment' },
  { id: 'waste-heat', key: 'wasteHeat' },
  { id: 'rural', key: 'rural' },
] as const

const roleIds: RoleId[] = ['benefits', 'pays', 'owns', 'operates']
const riskIds = ['connection', 'source', 'finance'] as const

function UseCaseDiagram({ selected, label, copy }: { selected: UseCaseId; label: string; copy: Landing['businessModels']['useCases'] }) {
  return (
    <svg className="use-case-diagram" viewBox="0 0 640 460" role="img" aria-label={label}>
      <defs>
        <pattern id="use-case-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0H0V32" fill="none" stroke="currentColor" strokeOpacity=".12" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="640" height="460" fill="url(#use-case-grid)" />
      <g key={selected} className="use-case-diagram__variant">
        {selected === 'refurbishment' && (
          <>
            <path className="diagram-network diagram-network--cool" d="M72 330H250V140H510V312H356" />
            <path className="diagram-network diagram-network--hot" d="M92 360H278V170H482V284H336" />
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const x = 150 + (index % 3) * 118
              const y = 198 + Math.floor(index / 3) * 92
              return <g key={index}><rect x={x} y={y} width="58" height="48" className="diagram-building" /><path d={`M${x + 12} ${y + 14}h34M${x + 12} ${y + 26}h34`} className="diagram-detail" /></g>
            })}
            <circle cx="250" cy="140" r="7" className="diagram-node diagram-node--cool" />
            <circle cx="278" cy="360" r="7" className="diagram-node diagram-node--hot" />
          </>
        )}
        {selected === 'waste-heat' && (
          <>
            <path className="diagram-network diagram-network--hot" d="M148 230H302V142H492M302 230V330H500" />
            <path className="diagram-network diagram-network--cool" d="M148 256H274V170H464M274 256V302H472" />
            <g><rect x="62" y="174" width="88" height="138" className="diagram-source" /><path d="M82 174v-42h20v42M112 174V112h20v62" className="diagram-detail" /><text x="62" y="344" className="diagram-label">{copy.diagramSource}</text></g>
            {[0, 1, 2, 3].map((index) => {
              const x = 404 + (index % 2) * 92
              const y = 150 + Math.floor(index / 2) * 150
              return <rect key={index} x={x} y={y} width="54" height="54" className="diagram-building" />
            })}
            <circle cx="302" cy="230" r="8" className="diagram-node diagram-node--hot" />
          </>
        )}
        {selected === 'rural' && (
          <>
            <path className="diagram-network diagram-network--cool" d="M54 302 168 244 266 282 376 174 566 116" />
            <path className="diagram-network diagram-network--hot" d="M64 330 174 272 266 310 390 202 574 144" />
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const points = [[86, 272], [164, 206], [250, 326], [340, 244], [450, 146], [552, 198]][index]
              return <g key={index} transform={`translate(${points[0]} ${points[1]})`}><path d="M0 16 24 0 48 16v36H0Z" className="diagram-building" /><path d="M-6 18 24-4 54 18" className="diagram-detail" /></g>
            })}
            <circle cx="266" cy="282" r="7" className="diagram-node diagram-node--cool" />
          </>
        )}
      </g>
      <text x="24" y="32" className="diagram-label">{copy.diagramTitle}</text>
      <text x="616" y="438" textAnchor="end" className="diagram-label">{copy.diagramFooter}</text>
    </svg>
  )
}

export function BusinessModelStory({ t }: { t: Landing }) {
  const [useCase, setUseCase] = useState<UseCaseId>('refurbishment')
  const [role, setRole] = useState<RoleId>('benefits')
  const [openRisk, setOpenRisk] = useState('connection')
  const { useCases, canvas, reality, scalability, implementation } = t.businessModels
  const activeKey = (useCaseIds.find((item) => item.id === useCase) ?? useCaseIds[0]).key
  const activeUseCase = useCases.items[activeKey]
  const activeRole = canvas.roles[role]

  return (
    <>
      <section className="story-section use-cases-section" id="business-use-cases" data-chapter aria-labelledby="use-cases-title">
        <div className="story-section__inner split-layout">
          <div className="section-copy" data-reveal>
            <p className="section-kicker section-kicker--hot">{useCases.kicker}</p>
            <h2 className="section-title" id="use-cases-title"><RichText text={useCases.title} /></h2>
            <p className="section-body">{activeUseCase.description}</p>
            <div className="use-case-switcher" role="group" aria-label={useCases.groupLabel}>
              {useCaseIds.map((item) => (
                <button key={item.id} type="button" aria-pressed={useCase === item.id} onClick={() => setUseCase(item.id)}>
                  <span>{useCases.items[item.key].shortTitle}</span><ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
                </button>
              ))}
            </div>
            <div className="use-case-focus" aria-live="polite">
              <span>{activeUseCase.title}</span>
              <p>{activeUseCase.focus}</p>
            </div>
          </div>
          <div className="use-case-visual" data-reveal>
            <UseCaseDiagram selected={useCase} label={`${activeUseCase.title} ${useCases.diagramSuffix}`} copy={useCases} />
            <div className="business-inputs" aria-label={useCases.inputsLabel}>
              {useCases.inputs.map((input) => <span key={input}>{input}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="story-section canvas-section" id="business-canvas" data-chapter aria-labelledby="canvas-title">
        <div className="story-section__inner">
          <div className="section-copy section-copy--wide" data-reveal>
            <p className="section-kicker section-kicker--hot">{canvas.kicker}</p>
            <h2 className="section-title" id="canvas-title"><RichText text={canvas.title} /></h2>
            <p className="section-body">{canvas.body}</p>
          </div>

          <div className="business-canvas" data-reveal>
            {canvas.blocks.map((block) => (
              <article key={block.title}>
                <h3>{block.title}</h3>
                <p>{block.text}</p>
              </article>
            ))}
          </div>

          <div className="allocation-map" data-reveal>
            <div className="allocation-tabs" role="group" aria-label={canvas.allocationLabel}>
              {roleIds.map((id) => (
                <button key={id} type="button" aria-pressed={role === id} onClick={() => setRole(id)}>{canvas.roles[id].label}</button>
              ))}
            </div>
            <div className="allocation-statement" aria-live="polite">
              <span>{canvas.allocationKicker}</span>
              <h3>{activeRole.title}</h3>
              <p>{activeRole.text}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="story-section reality-section" id="reality-check" data-chapter aria-labelledby="reality-title">
        <div className="story-section__inner split-layout split-layout--reverse">
          <div className="section-copy" data-reveal>
            <p className="section-kicker section-kicker--hot">{reality.kicker}</p>
            <h2 className="section-title" id="reality-title"><RichText text={reality.title} /></h2>
            <p className="section-body">{reality.body}</p>
          </div>

          <div className="risk-console" data-reveal>
            <div className="risk-console__heading"><ShieldAlert size={20} strokeWidth={1.5} aria-hidden="true" /><span>{reality.consoleTitle}</span><span>{reality.consoleTag}</span></div>
            {riskIds.map((id) => {
              const risk = reality.risks[id]
              const isOpen = openRisk === id
              return (
                <div className={`risk-item ${isOpen ? 'risk-item--open' : ''}`} key={id}>
                  <button type="button" aria-expanded={isOpen} aria-controls={`risk-panel-${id}`} onClick={() => setOpenRisk(isOpen ? '' : id)}>
                    <span><small>{risk.assumption}</small>{risk.title}</span>
                    <ChevronDown size={20} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                  <div className="risk-item__panel" id={`risk-panel-${id}`} hidden={!isOpen}>
                    <p>{risk.text}</p>
                  </div>
                </div>
              )
            })}
            <div className="deal-breaker">
              <span>{reality.dealBreakerLabel}</span>
              <p>{reality.dealBreaker}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="story-section scalability-section" id="scalability" data-chapter aria-labelledby="scalability-title">
        <div className="story-section__inner">
          <div className="section-copy" data-reveal>
            <p className="section-kicker">{scalability.kicker}</p>
            <h2 className="section-title" id="scalability-title"><RichText text={scalability.title} /></h2>
            <p className="section-body">{scalability.body}</p>
          </div>
          <div className="replication-ledger" data-reveal>
            {scalability.items.map((item) => (
              <div key={item.label}><span>{item.label}</span><h3>{item.title}</h3><p>{item.text}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="story-section implementation-section" id="implementation" data-chapter aria-labelledby="implementation-title">
        <div className="story-section__inner split-layout split-layout--reverse">
          <div className="section-copy" data-reveal>
            <p className="section-kicker section-kicker--hot">{implementation.kicker}</p>
            <h2 className="section-title" id="implementation-title"><RichText text={implementation.title} /></h2>
            <p className="section-body">{implementation.body}</p>
            <a className="text-link story-link" href="#methodology">{implementation.link}<ArrowDownRight size={17} strokeWidth={1.7} aria-hidden="true" /></a>
          </div>
          <ol className="implementation-path" data-reveal>
            {implementation.steps.map((step, index) => (
              <li key={step.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><h3>{step.title}</h3><p>{step.text}</p></div>
                <ArrowUpRight size={21} strokeWidth={1.4} aria-hidden="true" />
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}
