import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { EMPTY_VALUE } from '@/lib/i18n/format'
import { EXAMPLE_JUDGEMENTS, EXAMPLE_SCORE, EXAMPLE_TURNS } from '../sections/aiScoreExample'
import { MobileAiConsole } from './MobileAiConsole'

/** The console counts as in view at once (`inView`), or never; the viewer prefers reduced motion, or not. */
function stub(reducedMotion: boolean, inView = true) {
  vi.stubGlobal('IntersectionObserver', class {
    constructor(private callback: (entries: { isIntersecting: boolean; target: Element }[]) => void) {}
    observe(target: Element) {
      if (inView) this.callback([{ isIntersecting: true, target }])
    }
    disconnect() {}
    unobserve() {}
  })
  vi.stubGlobal('matchMedia', () => ({ matches: reducedMotion, addEventListener() {}, removeEventListener() {} }))
}

beforeEach(() => stub(true))
afterEach(() => vi.unstubAllGlobals())

describe('MobileAiConsole', () => {
  it('with reduced motion shows the final state at once: 27 cells in four turns, the score, the level, the dimensions', () => {
    const { container } = render(<MobileAiConsole copy={en.aiScore.console} lang="en" />)
    const copy = en.aiScore.console
    const console_ = container.querySelector('.m-ai')!
    expect(console_).toHaveAttribute('data-step', String(EXAMPLE_TURNS.length + 1))
    expect(console_).toHaveAttribute('data-scored', 'true')
    expect(container.querySelectorAll('.m-ai-turn')).toHaveLength(4)
    expect(container.querySelectorAll('.m-ai-turn__cells i')).toHaveLength(EXAMPLE_JUDGEMENTS)
    expect(container.querySelector('.m-ai-score__number')).toHaveTextContent(String(EXAMPLE_SCORE.score))
    expect(container.querySelector('.m-ai-score__band')).toHaveTextContent(`±${EXAMPLE_SCORE.band}`)
    expect(container.querySelector('.m-ai-score__level')).toHaveTextContent(copy.levels.promising)
    expect(container.querySelectorAll('.m-ai-dimensions li')).toHaveLength(7)
    for (const turn of [1, 2, 3, 4] as const) {
      expect(screen.getByText(copy.turns[turn])).toBeInTheDocument()
      expect(screen.getByText(copy.decisions[turn].name)).toBeInTheDocument()
    }
    expect(screen.getByRole('img', { name: `An example run: ${EXAMPLE_JUDGEMENTS} items scored in four turns, a score of ${EXAMPLE_SCORE.score} ± ${EXAMPLE_SCORE.band}, ${copy.levels.promising}.` })).toBeInTheDocument()
    expect(screen.getByText(copy.note)).toBeInTheDocument()
  })

  it('before the run shows no score: every turn pending, an empty value, no level', () => {
    stub(false, false)
    const { container } = render(<MobileAiConsole copy={en.aiScore.console} lang="en" />)
    const console_ = container.querySelector('.m-ai')!
    expect(console_).toHaveAttribute('data-step', '0')
    expect(console_).not.toHaveAttribute('data-scored')
    for (const turn of container.querySelectorAll('.m-ai-turn')) expect(turn).toHaveAttribute('data-state', 'pending')
    expect(container.querySelector('.m-ai-score__number')).toHaveTextContent(EMPTY_VALUE)
    expect(screen.getByRole('button', { name: en.aiScore.console.replay })).toBeInTheDocument()
  })

  it('formats the numbers for the language', () => {
    const { container } = render(<MobileAiConsole copy={en.aiScore.console} lang="de" />)
    expect(container.querySelector('.m-ai-score__number')).toHaveTextContent('60')
    expect(container.querySelector('.m-ai-scale__legend')).toHaveTextContent('< 40')
  })
})
