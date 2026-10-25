import { ArrowUpRight } from 'lucide-react'
import { RichText } from '../rich-text'
import type { Landing } from '../types'

const TOOLS = [
  { key: 'quickCheck', index: '01', href: '#m-quick-check', tone: 'cool' },
  { key: 'businessModels', index: '02', href: '#m-business-models', tone: 'hot' },
  { key: 'aiScore', index: 'AI', href: '#m-ai-score', tone: 'ai' },
] as const

/** "Three parts. One system.": the three rows that lead to their chapters. */
export function MobileTools({ t }: { t: Landing }) {
  const { tools } = t.product

  return (
    <section className="m-section" id="m-tools" aria-labelledby="m-tools-title">
      <div className="m-section__inner">
        <div className="m-section__copy" data-m-reveal>
          <p className="m-kicker">{tools.kicker}</p>
          <h2 className="m-title" id="m-tools-title"><RichText text={tools.title} /></h2>
        </div>
        <div className="m-tools" data-m-reveal>
          {TOOLS.map((tool) => {
            const item = tools[tool.key]
            return (
              <a key={tool.key} className={`m-tool m-tool--${tool.tone}`} href={tool.href}>
                <span className="m-tool__index">{tool.index}</span>
                <span className="m-tool__main">
                  <span className="m-tool__title">{item.title}</span>
                  <span className="m-tool__subtitle">{item.subtitle}</span>
                </span>
                <ArrowUpRight size={22} strokeWidth={1.5} aria-hidden="true" />
                <span className="m-tool__meta">{item.meta}</span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
