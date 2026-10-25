import type { CSSProperties } from 'react'
import { ArrowDown } from 'lucide-react'
import type { Landing } from '../types'
import { MobileDistrict } from './MobileDistrict'

const rise = (index: number) => ({ '--i': index }) as CSSProperties

/**
 * The hero: eyebrow, title, intro and the static district with its legend. Unlike the desktop it
 * has no gateway to the two tools: the tools chapter follows a screen later with the same links.
 */
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
    </section>
  )
}
