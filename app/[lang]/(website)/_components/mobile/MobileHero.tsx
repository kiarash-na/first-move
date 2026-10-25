import type { CSSProperties } from 'react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { RichText } from '../rich-text'
import type { Landing } from '../types'
import { MobileDistrict } from './MobileDistrict'

const TOOLS = [
  { key: 'quickCheck', index: '01', href: '#m-quick-check', tone: 'cool' },
  { key: 'businessModels', index: '02', href: '#m-business-models', tone: 'hot' },
] as const

const rise = (index: number) => ({ '--i': index }) as CSSProperties

/** The hero: eyebrow, title, intro, the static district with its legend, and the gateway to the two tools. */
export function MobileHero({ t }: { t: Landing }) {
  const copy = t.hero
  const visual = t.mobile.hero

  return (
    <section className="m-hero" id="m-overview" aria-labelledby="m-hero-title">
      <div className="m-hero__copy">
        <p className="m-eyebrow" data-m-rise style={rise(0)}>
          <i aria-hidden="true" />
          {copy.eyebrow}
        </p>
        <h1 id="m-hero-title" className="m-hero__title" aria-label={copy.titleLabel}>
          <span data-m-rise style={rise(1)}>{copy.titleLine1}</span>
          <span data-m-rise style={rise(2)}>{copy.titleLine2}</span>
          <span className="m-hero__accent" data-m-rise style={rise(3)}>{copy.titleLine3}</span>
        </h1>
        <p className="m-hero__intro" data-m-rise style={rise(4)}>{copy.intro}</p>
        <a className="m-text-link" href="#m-system" data-m-rise style={rise(5)}>
          {copy.discover}
          <ArrowDown size={17} strokeWidth={1.7} aria-hidden="true" />
        </a>
      </div>

      <figure className="m-hero__visual" data-m-rise style={rise(3)}>
        <MobileDistrict label={visual.visualAlt} />
        <figcaption className="m-hero__legend">
          <span className="m-hero__scene">{visual.visualLabel}</span>
          <span><i className="m-legend-line m-legend-line--cool" aria-hidden="true" />{copy.cooling}</span>
          <span><i className="m-legend-line m-legend-line--hot" aria-hidden="true" />{copy.heating}</span>
          <span className="m-hero__temperature">{copy.temperature}</span>
        </figcaption>
      </figure>

      <nav className="m-gateway" aria-labelledby="m-gateway-label" data-m-rise style={rise(6)}>
        <p className="m-gateway__label" id="m-gateway-label"><RichText text={copy.gatewayLabel} /></p>
        <div className="m-gateway__paths">
          {TOOLS.map((tool) => {
            const item = copy.tools[tool.key]
            return (
              <a key={tool.key} className={`m-tool-path m-tool-path--${tool.tone}`} href={tool.href}>
                <span className="m-tool-path__index">{tool.index}</span>
                <span className="m-tool-path__title">{item.title}</span>
                <span className="m-tool-path__description">{item.description}</span>
                <ArrowUpRight className="m-tool-path__arrow" size={22} strokeWidth={1.5} aria-hidden="true" />
              </a>
            )
          })}
        </div>
      </nav>
    </section>
  )
}
