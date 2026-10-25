import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import enAiScore from '@/dictionaries/en/ai-score.json'
import en from '@/dictionaries/en/landing.json'
import { EMPTY_VALUE } from '@/lib/i18n/format'
import { recordedRun } from '@/lib/presentation/blind-test/recorded-run'
import recorded from '@/lib/presentation/blind-test/result.json'
import { MobileAiConsole } from './MobileAiConsole'

const run = recordedRun(enAiScore.labels)
const year = new Date(recorded.input.created).getUTCFullYear()

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
  it('with reduced motion shows the recorded final state at once: 27 cells in four turns, the real decisions, the score, the level, the dimensions', () => {
    const { container } = render(<MobileAiConsole copy={en.aiScore.console} lang="en" run={run} />)
    const copy = en.aiScore.console
    const console_ = container.querySelector('.m-ai')!
    expect(console_).toHaveAttribute('data-step', String(run.turns.length + 1))
    expect(console_).toHaveAttribute('data-scored', 'true')
    expect(container.querySelectorAll('.m-ai-turn')).toHaveLength(4)
    const cells = container.querySelectorAll<HTMLElement>('.m-ai-turn__cells i')
    expect(cells).toHaveLength(recorded.judgements.length)
    expect([...cells].map((cell) => Number(cell.style.getPropertyValue('--level')))).toEqual(recorded.judgements.map((judgement) => judgement.level))
    expect(container.querySelector('.m-ai-score__number')).toHaveTextContent(String(recorded.score.shown))
    expect(container.querySelector('.m-ai-score__band')).toHaveTextContent(`±${recorded.score.band}`)
    expect(container.querySelector('.m-ai-score__level')).toHaveTextContent(copy.levels[run.level])
    expect(container.querySelector('.m-ai-score__capped')).toHaveTextContent(/^Must-have failed · \d+ dimensions capped$/)
    expect(container.querySelectorAll('.m-ai-dimensions li')).toHaveLength(7)
    expect(container.querySelectorAll('.m-ai-dimensions li[data-capped]')).toHaveLength(recorded.dimensions.filter((dimension) => dimension.cap !== null).length)
    for (const turn of run.turns) {
      expect(screen.getByText(copy.turns[turn.turn])).toBeInTheDocument()
      expect(screen.getByText(turn.decision.name)).toBeInTheDocument()
    }
    expect(screen.getByText(enAiScore.labels.gates.boundary.name).nextElementSibling).toHaveTextContent(enAiScore.labels.outcomes.fail)
    expect(screen.getByRole('img', { name: `A recorded run on a real Vienna plan from ${year}: ${recorded.judgements.length} items scored in four turns, a score of ${recorded.score.shown} ± ${recorded.score.band}, ${copy.levels[run.level]}.` })).toBeInTheDocument()
  })

  it('is labelled as the recorded run on the real plan and links the blind test on slide 5', () => {
    const { container } = render(<MobileAiConsole copy={en.aiScore.console} lang="de" run={run} />)
    expect(container.querySelector('.m-ai__head')).toHaveTextContent(en.aiScore.console.title)
    expect(container.querySelector('.m-ai__tag')).toHaveTextContent(`Real Vienna plan · ${year}`)
    const note = container.querySelector('.m-ai__note')!
    expect(note).toHaveTextContent(`business plan from ${year}`)
    expect(note.textContent).not.toMatch(/\{\w+\}/)
    expect(screen.getByRole('link', { name: en.aiScore.console.link })).toHaveAttribute('href', '/de/presentation#5')
  })

  it('before the run shows no score: every turn pending, an empty value, no band, no level', () => {
    stub(false, false)
    const { container } = render(<MobileAiConsole copy={en.aiScore.console} lang="en" run={run} />)
    const console_ = container.querySelector('.m-ai')!
    expect(console_).toHaveAttribute('data-step', '0')
    expect(console_).not.toHaveAttribute('data-scored')
    for (const turn of container.querySelectorAll('.m-ai-turn')) expect(turn).toHaveAttribute('data-state', 'pending')
    expect(container.querySelector('.m-ai-score__number')).toHaveTextContent(EMPTY_VALUE)
    expect(container.querySelector('.m-ai-score__band')).toBeNull()
    expect(screen.getByRole('button', { name: en.aiScore.console.replay })).toBeInTheDocument()
  })

  it('formats the numbers for the language', () => {
    const { container } = render(<MobileAiConsole copy={en.aiScore.console} lang="de" run={run} />)
    expect(container.querySelector('.m-ai-score__number')).toHaveTextContent(String(recorded.score.shown))
    expect(container.querySelector('.m-ai-scale__legend')).toHaveTextContent('< 40')
  })
})
