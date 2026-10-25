import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import type { ToolId } from '../Header'
import { RichText } from '../rich-text'
import type { Landing } from '../types'

interface ProductStoryProps {
  t: Landing
  onToolSelect: (tool: ToolId) => void
}

export function ProductStory({ t, onToolSelect }: ProductStoryProps) {
  const { promise, audiences, tools } = t.product

  return (
    <>
      <section className="story-section promise-section" id="promise" data-chapter aria-labelledby="promise-title">
        <div className="story-section__inner">
          <div className="section-copy" data-reveal>
            <p className="section-kicker">{promise.kicker}</p>
            <h2 className="section-title" id="promise-title">
              <RichText text={promise.title} />
            </h2>
            <p className="section-body">{promise.body}</p>
            <a className="text-link story-link" href="#tools">
              {promise.link}
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
            <p className="section-kicker">{tools.kicker}</p>
            <h2 className="section-title" id="tools-title"><RichText text={tools.title} /></h2>
          </div>

          <div className="tool-chapters" data-reveal>
            <a
              className="tool-chapter tool-chapter--cool"
              href="#quick-inputs"
              onClick={() => onToolSelect('quick-check')}
            >
              <span className="tool-chapter__index">01</span>
              <span className="tool-chapter__main">
                <span className="tool-chapter__title">{tools.quickCheck.title}</span>
                <span className="tool-chapter__subtitle">{tools.quickCheck.subtitle}</span>
              </span>
              <span className="tool-chapter__meta">{tools.quickCheck.meta}</span>
              <ArrowUpRight size={32} strokeWidth={1.3} aria-hidden="true" />
            </a>
            <a
              className="tool-chapter tool-chapter--hot"
              href="#business-use-cases"
              onClick={() => onToolSelect('business-models')}
            >
              <span className="tool-chapter__index">02</span>
              <span className="tool-chapter__main">
                <span className="tool-chapter__title">{tools.businessModels.title}</span>
                <span className="tool-chapter__subtitle">{tools.businessModels.subtitle}</span>
              </span>
              <span className="tool-chapter__meta">{tools.businessModels.meta}</span>
              <ArrowUpRight size={32} strokeWidth={1.3} aria-hidden="true" />
            </a>
            <a className="tool-chapter tool-chapter--ai" href="#ai-score">
              <span className="tool-chapter__index">AI</span>
              <span className="tool-chapter__main">
                <span className="tool-chapter__title">{tools.aiScore.title}</span>
                <span className="tool-chapter__subtitle">{tools.aiScore.subtitle}</span>
              </span>
              <span className="tool-chapter__meta">{tools.aiScore.meta}</span>
              <ArrowUpRight size={32} strokeWidth={1.3} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
