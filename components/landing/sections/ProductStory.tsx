import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import type { ToolId } from '../Header'

interface ProductStoryProps {
  onToolSelect: (tool: ToolId) => void
}

const audiences = [
  { title: 'Municipalities', text: 'Turn local energy potential into a clear project pathway.' },
  { title: 'Energy service providers', text: 'Move from network opportunity to an operating structure.' },
  { title: 'Project initiators', text: 'Test the first idea before committing to full feasibility.' },
]

export function ProductStory({ onToolSelect }: ProductStoryProps) {
  return (
    <>
      <section className="story-section promise-section" id="promise" data-chapter aria-labelledby="promise-title">
        <div className="story-section__inner">
          <div className="section-copy" data-reveal>
            <p className="section-kicker">One continuous workflow</p>
            <h2 className="section-title" id="promise-title">
              From first signal<br />to a viable<br /><em>business case.</em>
            </h2>
            <p className="section-body">
              A digital operating system for low-temperature, bidirectional 5GDHC networks—connecting
              buildings with renewables and waste heat through heat pumps, from the first project area
              to a model people can actually implement.
            </p>
            <a className="text-link story-link" href="#tools">
              See how the system fits together
              <ArrowDownRight size={17} strokeWidth={1.7} aria-hidden="true" />
            </a>
          </div>

          <div className="audience-rail" data-reveal>
            {audiences.map((audience) => (
              <div className="audience-item" key={audience.title}>
                <h3>{audience.title}</h3>
                <p>{audience.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="story-section tools-section" id="tools" data-chapter aria-labelledby="tools-title">
        <div className="story-section__inner">
          <div className="section-copy section-copy--wide" data-reveal>
            <p className="section-kicker">Two tools. One system.</p>
            <h2 className="section-title" id="tools-title">First know if.<br /><em>Then know how.</em></h2>
          </div>

          <div className="tool-chapters" data-reveal>
            <a
              className="tool-chapter tool-chapter--cool"
              href="#quick-inputs"
              onClick={() => onToolSelect('quick-check')}
            >
              <span className="tool-chapter__index">01</span>
              <span className="tool-chapter__main">
                <span className="tool-chapter__title">Quick Check</span>
                <span className="tool-chapter__subtitle">Screen the technical and economic potential.</span>
              </span>
              <span className="tool-chapter__meta">3-level assessment · decisive factors · output document</span>
              <ArrowUpRight size={32} strokeWidth={1.3} aria-hidden="true" />
            </a>
            <a
              className="tool-chapter tool-chapter--hot"
              href="#business-use-cases"
              onClick={() => onToolSelect('business-models')}
            >
              <span className="tool-chapter__index">02</span>
              <span className="tool-chapter__main">
                <span className="tool-chapter__title">Business Models</span>
                <span className="tool-chapter__subtitle">Structure value, ownership, risk and operation.</span>
              </span>
              <span className="tool-chapter__meta">Canvas · Reality Check · replication · next steps</span>
              <ArrowUpRight size={32} strokeWidth={1.3} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
