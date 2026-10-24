import { ArrowDown, ArrowLeftRight, ArrowUpRight, MousePointer2 } from 'lucide-react'
import type { ToolId } from '../Header'

interface HeroProps {
  selectedTool: ToolId | null
  flowDirection: 1 | -1
  onFlowDirectionChange: () => void
  onToolSelect: (tool: ToolId) => void
}

const toolCopy: Record<ToolId, { index: string; title: string; description: string; sceneLabel: string; target: string }> = {
  'quick-check': {
    index: '01',
    title: 'Quick Check',
    description: 'Screen the potential. See the decisive factors.',
    sceneLabel: 'Screening mode · three-level assessment',
    target: 'quick-inputs',
  },
  'business-models': {
    index: '02',
    title: 'Business Models',
    description: 'Allocate value, investment, risk and responsibility.',
    sceneLabel: 'Business mode · value and risk allocation',
    target: 'business-use-cases',
  },
}

export function Hero({ selectedTool, flowDirection, onFlowDirectionChange, onToolSelect }: HeroProps) {
  const sceneLabel = selectedTool
    ? toolCopy[selectedTool].sceneLabel
    : 'Interactive district · low-temperature network'

  return (
    <section className={`hero ${selectedTool ? `hero--${selectedTool}` : ''}`} id="overview" data-chapter aria-labelledby="hero-title">
      <div className="hero__shade" aria-hidden="true" />
      <div className="hero__inner">
        <div className="hero__copy">
          <p className="hero__eyebrow reveal reveal--1">
            <span className="signal-dot" aria-hidden="true" />
            5th Generation District Heating &amp; Cooling
          </p>
          <h1 id="hero-title" className="hero__title" aria-label="The operating system for shared energy">
            <span className="title-line reveal reveal--2">The operating</span>
            <span className="title-line reveal reveal--3">system for</span>
            <span className="title-line title-line--serif reveal reveal--4">shared energy.</span>
          </h1>
          <div className="hero__intro reveal reveal--5" id="why-5gdhc">
            <p>
              From first screening to a viable business model—for low-temperature,
              bidirectional networks connecting buildings with local renewables and waste heat.
            </p>
            <a className="text-link" href="#promise">
              Discover the system
              <ArrowDown size={17} strokeWidth={1.7} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="scene-hud reveal reveal--5" aria-live="polite">
          <div className="scene-hud__status">
            <span className="scene-hud__cross" aria-hidden="true">+</span>
            <span>{sceneLabel}</span>
          </div>
          <div className="scene-hud__legend" aria-label="Energy network legend">
            <span><i className="legend-line legend-line--cool" aria-hidden="true" />Cooling</span>
            <span><i className="legend-line legend-line--hot" aria-hidden="true" />Heating</span>
            <span className="scene-hud__temperature">5–25°C</span>
          </div>
        </div>

        <div className="scene-annotation scene-annotation--top reveal reveal--6" aria-hidden="true">
          <span>Bidirectional flow</span><i />
        </div>
        <div className="scene-annotation scene-annotation--side reveal reveal--6" aria-hidden="true">
          <span>Local sources</span><i />
        </div>

        <div className="scene-controls reveal reveal--6">
          <span className="scene-controls__hint">
            <MousePointer2 size={14} strokeWidth={1.6} aria-hidden="true" />
            Move to shift perspective
          </span>
          <button className="flow-control" type="button" aria-pressed={flowDirection === -1} onClick={onFlowDirectionChange}>
            <ArrowLeftRight size={16} strokeWidth={1.6} aria-hidden="true" />
            {flowDirection === 1 ? 'Reverse flow' : 'Restore flow'}
          </button>
        </div>

        <div className="tool-gateway reveal reveal--6" id="start" tabIndex={-1}>
          <p className="tool-gateway__label">Two tools.<br />One operating system.</p>
          <div className="tool-gateway__paths">
            {(Object.keys(toolCopy) as ToolId[]).map((tool) => {
              const item = toolCopy[tool]
              const isSelected = selectedTool === tool
              return (
                <button
                  id={tool}
                  key={tool}
                  type="button"
                  className={`tool-path ${isSelected ? 'tool-path--selected' : ''}`}
                  aria-pressed={isSelected}
                  onClick={() => {
                    onToolSelect(tool)
                    document.getElementById(item.target)?.scrollIntoView({
                      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
                    })
                  }}
                >
                  <span className="tool-path__top">
                    <span className="tool-path__index">{item.index}</span>
                    <ArrowUpRight className="tool-path__arrow" size={22} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <span className="tool-path__title">{item.title}</span>
                  <span className="tool-path__description">{item.description}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
