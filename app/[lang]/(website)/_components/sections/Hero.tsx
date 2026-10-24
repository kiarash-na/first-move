import { ArrowDown, ArrowLeftRight, ArrowUpRight, MousePointer2 } from 'lucide-react'
import type { ToolId } from '../Header'
import { RichText } from '../rich-text'
import type { Landing } from '../types'

interface HeroProps {
  t: Landing
  selectedTool: ToolId | null
  flowDirection: 1 | -1
  onFlowDirectionChange: () => void
  onToolSelect: (tool: ToolId) => void
}

const toolMeta: Record<ToolId, { index: string; target: string }> = {
  'quick-check': { index: '01', target: 'quick-inputs' },
  'business-models': { index: '02', target: 'business-use-cases' },
}

export function Hero({ t, selectedTool, flowDirection, onFlowDirectionChange, onToolSelect }: HeroProps) {
  const copy = t.hero
  const toolCopy: Record<ToolId, { title: string; description: string; sceneLabel: string }> = {
    'quick-check': copy.tools.quickCheck,
    'business-models': copy.tools.businessModels,
  }
  const sceneLabel = selectedTool ? toolCopy[selectedTool].sceneLabel : copy.sceneDefault

  return (
    <section className={`hero ${selectedTool ? `hero--${selectedTool}` : ''}`} id="overview" data-chapter aria-labelledby="hero-title">
      <div className="hero__shade" aria-hidden="true" />
      <div className="hero__inner">
        <div className="hero__copy">
          <p className="hero__eyebrow reveal reveal--1">
            <span className="signal-dot" aria-hidden="true" />
            {copy.eyebrow}
          </p>
          <h1 id="hero-title" className="hero__title" aria-label={copy.titleLabel}>
            <span className="title-line reveal reveal--2">{copy.titleLine1}</span>
            <span className="title-line reveal reveal--3">{copy.titleLine2}</span>
            <span className="title-line title-line--serif reveal reveal--4">{copy.titleLine3}</span>
          </h1>
          <div className="hero__intro reveal reveal--5" id="why-5gdhc">
            <p>{copy.intro}</p>
            <a className="text-link" href="#promise">
              {copy.discover}
              <ArrowDown size={17} strokeWidth={1.7} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="scene-hud reveal reveal--5" aria-live="polite">
          <div className="scene-hud__status">
            <span className="scene-hud__cross" aria-hidden="true">+</span>
            <span>{sceneLabel}</span>
          </div>
          <div className="scene-hud__legend" aria-label={copy.legendLabel}>
            <span><i className="legend-line legend-line--cool" aria-hidden="true" />{copy.cooling}</span>
            <span><i className="legend-line legend-line--hot" aria-hidden="true" />{copy.heating}</span>
            <span className="scene-hud__temperature">{copy.temperature}</span>
          </div>
        </div>

        <div className="scene-annotation scene-annotation--top reveal reveal--6" aria-hidden="true">
          <span>{copy.annotationTop}</span><i />
        </div>
        <div className="scene-annotation scene-annotation--side reveal reveal--6" aria-hidden="true">
          <span>{copy.annotationSide}</span><i />
        </div>

        <div className="scene-controls reveal reveal--6">
          <span className="scene-controls__hint">
            <MousePointer2 size={14} strokeWidth={1.6} aria-hidden="true" />
            {copy.hint}
          </span>
          <button className="flow-control" type="button" aria-pressed={flowDirection === -1} onClick={onFlowDirectionChange}>
            <ArrowLeftRight size={16} strokeWidth={1.6} aria-hidden="true" />
            {flowDirection === 1 ? copy.reverseFlow : copy.restoreFlow}
          </button>
        </div>

        <div className="tool-gateway reveal reveal--6" id="start" tabIndex={-1}>
          <p className="tool-gateway__label"><RichText text={copy.gatewayLabel} /></p>
          <div className="tool-gateway__paths">
            {(Object.keys(toolCopy) as ToolId[]).map((tool) => {
              const item = { ...toolMeta[tool], ...toolCopy[tool] }
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
