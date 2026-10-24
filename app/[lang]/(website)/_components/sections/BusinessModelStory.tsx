'use client'

import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight, ChevronDown, ShieldAlert } from 'lucide-react'

type UseCaseId = 'refurbishment' | 'waste-heat' | 'rural'
type RoleId = 'benefits' | 'pays' | 'owns' | 'operates'

const useCases: { id: UseCaseId; title: string; shortTitle: string; description: string; focus: string }[] = [
  {
    id: 'refurbishment',
    title: 'Existing neighbourhood refurbishment',
    shortTitle: 'Neighbourhood',
    description: 'Connect existing buildings through a low-temperature refurbishment pathway.',
    focus: 'Customer segments, connection rates, tariffs and renovation timing.',
  },
  {
    id: 'waste-heat',
    title: 'Waste-heat integration',
    shortTitle: 'Waste heat',
    description: 'Turn an available local source into shared value across the network.',
    focus: 'Source availability, temperature, ownership, capex and heat off-take.',
  },
  {
    id: 'rural',
    title: 'Rural / low-density networks',
    shortTitle: 'Low density',
    description: 'Test viability where demand is dispersed and every assumption matters.',
    focus: 'Connection rates, network length, financing and subsidy assumptions.',
  },
]

const businessInputs = ['Customer segments', 'Heating + cooling needs', 'Heat sources', 'Connection rates', 'Tariffs', 'Capex', 'Financing', 'Subsidies']

const canvasBlocks = [
  { title: 'Value proposition', text: 'The value each customer segment actually receives.' },
  { title: 'Key partners', text: 'The organisations required to make the model work.' },
  { title: 'Operator responsibilities', text: 'Clear ownership of operation, coordination and delivery.' },
  { title: 'Cost structure', text: 'Investment and operating costs visible in one structure.' },
  { title: 'Revenue streams', text: 'Tariffs, connections and other revenues linked to the model.' },
  { title: 'Investment · risk · benefits', text: 'Explicit allocation instead of implicit assumptions.' },
]

const roles: { id: RoleId; label: string; title: string; text: string }[] = [
  { id: 'benefits', label: 'Benefits', title: 'Who benefits?', text: 'Customer segments and local system benefits are made visible alongside the value proposition.' },
  { id: 'pays', label: 'Pays', title: 'Who pays?', text: 'Connection and tariff assumptions are connected to the customers and revenue streams they affect.' },
  { id: 'owns', label: 'Owns', title: 'Who owns?', text: 'Ownership and investment responsibilities are assigned explicitly for the selected use case.' },
  { id: 'operates', label: 'Operates', title: 'Who operates?', text: 'Operator duties and key partnerships become part of the model—not an implementation afterthought.' },
]

const risks = [
  {
    id: 'connection',
    title: 'Connection-rate sensitivity',
    assumption: 'Critical assumption',
    text: 'Test how dependent the model is on the expected share of buildings actually connecting to the network.',
  },
  {
    id: 'source',
    title: 'Heat-source availability',
    assumption: 'Top risk',
    text: 'Expose uncertainty around source temperature, timing, continuity and the agreements needed to secure it.',
  },
  {
    id: 'finance',
    title: 'Financing and subsidy exposure',
    assumption: 'Potential deal-breaker',
    text: 'Make the model’s dependence on financing conditions or public support explicit before implementation begins.',
  },
]

const implementationSteps = [
  { number: '01', title: 'Confirm', text: 'Validate the decisive screening assumptions and local source conditions.' },
  { number: '02', title: 'Detail', text: 'Move the promising setup into the required technical and economic feasibility work.' },
  { number: '03', title: 'Align', text: 'Agree ownership, operator responsibilities, financing and risk allocation with partners.' },
  { number: '04', title: 'Implement', text: 'Turn the selected model into a sequenced implementation outline with clear next actions.' },
]

function UseCaseDiagram({ selected }: { selected: UseCaseId }) {
  return (
    <svg className="use-case-diagram" viewBox="0 0 640 460" role="img" aria-label={`${useCases.find((item) => item.id === selected)?.title} network diagram`}>
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
            <g><rect x="62" y="174" width="88" height="138" className="diagram-source" /><path d="M82 174v-42h20v42M112 174V112h20v62" className="diagram-detail" /><text x="62" y="344" className="diagram-label">LOCAL SOURCE</text></g>
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
      <text x="24" y="32" className="diagram-label">ILLUSTRATIVE NETWORK TYPOLOGY</text>
      <text x="616" y="438" textAnchor="end" className="diagram-label">5GDHC / USE CASE</text>
    </svg>
  )
}

export function BusinessModelStory() {
  const [useCase, setUseCase] = useState<UseCaseId>('refurbishment')
  const [role, setRole] = useState<RoleId>('benefits')
  const [openRisk, setOpenRisk] = useState('connection')
  const activeUseCase = useCases.find((item) => item.id === useCase) ?? useCases[0]
  const activeRole = roles.find((item) => item.id === role) ?? roles[0]

  return (
    <>
      <section className="story-section use-cases-section" id="business-use-cases" data-chapter aria-labelledby="use-cases-title">
        <div className="story-section__inner split-layout">
          <div className="section-copy" data-reveal>
            <p className="section-kicker section-kicker--hot">Business Models · Use cases</p>
            <h2 className="section-title" id="use-cases-title">One system.<br /><em>Different realities.</em></h2>
            <p className="section-body">{activeUseCase.description}</p>
            <div className="use-case-switcher" role="group" aria-label="Business model use case">
              {useCases.map((item) => (
                <button key={item.id} type="button" aria-pressed={useCase === item.id} onClick={() => setUseCase(item.id)}>
                  <span>{item.shortTitle}</span><ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
                </button>
              ))}
            </div>
            <div className="use-case-focus" aria-live="polite">
              <span>{activeUseCase.title}</span>
              <p>{activeUseCase.focus}</p>
            </div>
          </div>
          <div className="use-case-visual" data-reveal>
            <UseCaseDiagram selected={useCase} />
            <div className="business-inputs" aria-label="Business model input categories">
              {businessInputs.map((input) => <span key={input}>{input}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="story-section canvas-section" id="business-canvas" data-chapter aria-labelledby="canvas-title">
        <div className="story-section__inner">
          <div className="section-copy section-copy--wide" data-reveal>
            <p className="section-kicker section-kicker--hot">Tailored Business Model Canvas</p>
            <h2 className="section-title" id="canvas-title">Make the whole<br /><em>model visible.</em></h2>
            <p className="section-body">
              Not just costs and revenues. The canvas connects the value proposition to partners,
              responsibilities and the explicit allocation of investment, risk and benefits.
            </p>
          </div>

          <div className="business-canvas" data-reveal>
            {canvasBlocks.map((block) => (
              <article key={block.title}>
                <h3>{block.title}</h3>
                <p>{block.text}</p>
              </article>
            ))}
          </div>

          <div className="allocation-map" data-reveal>
            <div className="allocation-tabs" role="group" aria-label="Business model allocation view">
              {roles.map((item) => (
                <button key={item.id} type="button" aria-pressed={role === item.id} onClick={() => setRole(item.id)}>{item.label}</button>
              ))}
            </div>
            <div className="allocation-statement" aria-live="polite">
              <span>Allocation view</span>
              <h3>{activeRole.title}</h3>
              <p>{activeRole.text}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="story-section reality-section" id="reality-check" data-chapter aria-labelledby="reality-title">
        <div className="story-section__inner split-layout split-layout--reverse">
          <div className="section-copy" data-reveal>
            <p className="section-kicker section-kicker--hot">Reality Check</p>
            <h2 className="section-title" id="reality-title">Stress-test<br />the story.<br /><em>Before reality does.</em></h2>
            <p className="section-body">
              Critical assumptions, top risks and the potential deal-breaker are brought into the open.
              The goal is not a nicer presentation—it is a model that survives difficult questions.
            </p>
          </div>

          <div className="risk-console" data-reveal>
            <div className="risk-console__heading"><ShieldAlert size={20} strokeWidth={1.5} aria-hidden="true" /><span>Assumption scan</span><span>03 CHECKS</span></div>
            {risks.map((risk) => {
              const isOpen = openRisk === risk.id
              return (
                <div className={`risk-item ${isOpen ? 'risk-item--open' : ''}`} key={risk.id}>
                  <button type="button" aria-expanded={isOpen} aria-controls={`risk-panel-${risk.id}`} onClick={() => setOpenRisk(isOpen ? '' : risk.id)}>
                    <span><small>{risk.assumption}</small>{risk.title}</span>
                    <ChevronDown size={20} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                  <div className="risk-item__panel" id={`risk-panel-${risk.id}`} hidden={!isOpen}>
                    <p>{risk.text}</p>
                  </div>
                </div>
              )
            })}
            <div className="deal-breaker">
              <span>Potential deal-breaker</span>
              <p>The condition that invalidates the model is made explicit—not buried in a footnote.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="story-section scalability-section" id="scalability" data-chapter aria-labelledby="scalability-title">
        <div className="story-section__inner">
          <div className="section-copy" data-reveal>
            <p className="section-kicker">Scalability &amp; replicability</p>
            <h2 className="section-title" id="scalability-title">Replicate the logic.<br /><em>Adapt the network.</em></h2>
            <p className="section-body">
              A viable model should travel across settlement typologies without ignoring local reality.
              The operating structure stays coherent while sources, density and customer needs change.
            </p>
          </div>
          <div className="replication-ledger" data-reveal>
            <div><span>01 / TYPOLOGIES</span><h3>Across settlement types</h3><p>Assess scalability and replicability as part of the model itself.</p></div>
            <div><span>02 / RESILIENCE</span><h3>Stronger local systems</h3><p>Support resilience through structured, transparent network decisions.</p></div>
            <div><span>03 / LOCAL SUPPLY</span><h3>Energy already nearby</h3><p>Build around locally available renewables and waste-heat potential.</p></div>
          </div>
        </div>
      </section>

      <section className="story-section implementation-section" id="implementation" data-chapter aria-labelledby="implementation-title">
        <div className="story-section__inner split-layout split-layout--reverse">
          <div className="section-copy" data-reveal>
            <p className="section-kicker section-kicker--hot">Next-step implementation outline</p>
            <h2 className="section-title" id="implementation-title">End with<br /><em>a next move.</em></h2>
            <p className="section-body">
              The output does not stop at a canvas. It turns the selected model into a practical
              outline for the work, alignment and decisions that come next.
            </p>
            <a className="text-link story-link" href="#methodology">Check the methodology<ArrowDownRight size={17} strokeWidth={1.7} aria-hidden="true" /></a>
          </div>
          <ol className="implementation-path" data-reveal>
            {implementationSteps.map((step) => (
              <li key={step.number}>
                <span>{step.number}</span>
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
