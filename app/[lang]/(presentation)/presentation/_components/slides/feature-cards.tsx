"use client"

import { Activity, Box, Landmark, Map as MapIcon, Plus, Users, type LucideIcon } from "lucide-react"
import { useId, useState, type CSSProperties } from "react"
import { padSlideNumber } from "@/lib/presentation/slides"

export interface Feature {
  id: string
  title: string
  text: string
}

const ICONS: Record<string, LucideIcon> = { scan: Box, map: MapIcon, owners: Users, funding: Landmark, twin: Activity }

const FACES = ["front", "back", "left", "right", "top"] as const

/** The lead card's picture: a wireframe building turning under a scan plane (CSS 3D, `presentation.css`). */
function ScanVisual() {
  return (
    <span className="scan" aria-hidden="true">
      <span className="scan__box">
        {FACES.map((face) => (
          <span key={face} className={`scan__face scan__face--${face}`} />
        ))}
      </span>
      <span className="scan__plane" />
    </span>
  )
}

/** Slide 9: the next moves as cards; a card opens on click to say what it would do. The 3D scan leads. */
export function FeatureCards({ features }: { features: readonly Feature[] }) {
  const [open, setOpen] = useState<string | null>(features[0]?.id ?? null)
  const id = useId()

  return (
    <ul className="features">
      {features.map((feature, index) => {
        const Icon = ICONS[feature.id] ?? Box
        const expanded = open === feature.id
        return (
          <li key={feature.id} className="feature" data-open={expanded || undefined} data-lead={index === 0 || undefined} data-reveal style={{ "--i": 3 + index } as CSSProperties}>
            <button type="button" className="feature__button" aria-expanded={expanded} aria-controls={`${id}-${feature.id}`} onClick={() => setOpen(expanded ? null : feature.id)}>
              <span className="feature__number" aria-hidden="true">
                {padSlideNumber(index + 1)}
              </span>
              <Icon className="feature__icon" size={30} strokeWidth={1.5} aria-hidden="true" />
              {index === 0 ? <ScanVisual /> : null}
              <span className="feature__title">{feature.title}</span>
              <Plus className="feature__plus" size={16} strokeWidth={1.6} aria-hidden="true" />
            </button>
            <div className="feature__reveal" id={`${id}-${feature.id}`}>
              <p>{feature.text}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
