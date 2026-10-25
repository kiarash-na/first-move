import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import deAiScore from '@/dictionaries/de/ai-score.json'
import de from '@/dictionaries/de/landing.json'
import enAiScore from '@/dictionaries/en/ai-score.json'
import en from '@/dictionaries/en/landing.json'
import { EMPTY_VALUE } from '@/lib/i18n/format'
import { recordedRun } from '@/lib/presentation/blind-test/recorded-run'
import recorded from '@/lib/presentation/blind-test/result.json'
import { AiScoreConsole } from './AiScoreConsole'

type Callback = (entries: { isIntersecting: boolean }[]) => void
let intersect: Callback | null = null

const run = recordedRun(enAiScore.labels)
const year = new Date(recorded.input.created).getUTCFullYear()

beforeEach(() => {
  vi.useFakeTimers()
  intersect = null
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: Callback) {
      intersect = callback
    }
    observe() {}
    disconnect() {}
    unobserve() {}
  })
  // Reduced motion: the final state shows at once, so the test needs no animation frames.
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {}, removeEventListener() {} }))
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('AiScoreConsole', () => {
  it('renders the four turns with the recorded 27 cells and one real decision each, named from the dictionaries', () => {
    const { container } = render(<AiScoreConsole copy={en.aiScore.console} lang="en" run={run} />)
    const rows = container.querySelectorAll<HTMLElement>('.ai-turn')
    expect(rows).toHaveLength(run.turns.length)
    run.turns.forEach((turn, index) => {
      const row = within(rows[index])
      expect(row.getByText(en.aiScore.console.turns[turn.turn])).toBeInTheDocument()
      expect(row.getByText(turn.decision.name)).toBeInTheDocument()
      // Two gates of the recording are unclear, so the result is looked up inside its own row.
      expect(row.getByText(turn.decision.result)).toBeInTheDocument()
    })
    const cells = container.querySelectorAll<HTMLElement>('.ai-turn__cells i')
    expect(cells).toHaveLength(recorded.judgements.length)
    expect([...cells].map((cell) => Number(cell.style.getPropertyValue('--level')))).toEqual(recorded.judgements.map((judgement) => judgement.level))
    // The real decisions of the recording: the source branch, the failed boundary gate, two unclear gates.
    expect(screen.getByText(enAiScore.labels.gates.boundary.name).nextElementSibling).toHaveTextContent(enAiScore.labels.outcomes.fail)
    expect(container.querySelectorAll('.ai-turn__decision--fail')).toHaveLength(1)
    expect(container.querySelectorAll('.ai-dimensions li')).toHaveLength(7)
    expect(container.querySelectorAll('.ai-dimensions li[data-capped]')).toHaveLength(recorded.dimensions.filter((dimension) => dimension.cap !== null).length)
    expect(screen.getByText(en.aiScore.console.evidence[4])).toBeInTheDocument()
    expect(container.querySelector('.ai-console')).toHaveAttribute('data-step', '0')
  })

  it('is labelled as the recorded run on the real plan, with its dates and a link to the blind test on slide 5', () => {
    const { container } = render(<AiScoreConsole copy={en.aiScore.console} lang="de" run={run} />)
    expect(container.querySelector('.ai-console__title')).toHaveTextContent(en.aiScore.console.title)
    expect(container.querySelector('.ai-console__tag')).toHaveTextContent(`Real Vienna plan · ${year}`)
    const note = container.querySelector('.ai-console__note')!
    expect(note).toHaveTextContent(`business plan from ${year}`)
    expect(note).toHaveTextContent(new Date(recorded.at).getUTCFullYear().toString())
    expect(note.textContent).not.toMatch(/\{\w+\}/)
    expect(screen.getByRole('link', { name: en.aiScore.console.link })).toHaveAttribute('href', '/de/presentation#5')
  })

  it('before the run shows no score: the empty value, no band, and the console is not scored', () => {
    const { container } = render(<AiScoreConsole copy={en.aiScore.console} lang="en" run={run} />)
    expect(container.querySelector('.ai-console')).not.toHaveAttribute('data-scored')
    expect(container.querySelector('.ai-result__number')).toHaveTextContent(EMPTY_VALUE)
    expect(container.querySelector('.ai-result__band')).toBeNull()
  })

  it('shows the recorded score once the console is in view, says a must-have failed, and the summary names it for assistive technology', () => {
    const { container } = render(<AiScoreConsole copy={en.aiScore.console} lang="en" run={run} />)
    act(() => intersect?.([{ isIntersecting: true }]))
    expect(container.querySelector('.ai-console')).toHaveAttribute('data-step', '5')
    expect(container.querySelector('.ai-result__number')).toHaveTextContent(String(recorded.score.shown))
    expect(container.querySelector('.ai-result__band')).toHaveTextContent(`±${recorded.score.band}`)
    expect(container.querySelector('.ai-result__level')).toHaveTextContent(en.aiScore.console.levels[run.level])
    expect(container.querySelector('.ai-result__capped')).toHaveTextContent(/^Must-have failed · \d+ dimensions capped$/)
    expect(screen.getByRole('img')).toHaveAccessibleName(
      `A recorded run on a real Vienna plan from ${year}: ${recorded.judgements.length} items scored in four turns, a score of ${recorded.score.shown} ± ${recorded.score.band}, ${en.aiScore.console.levels[run.level]}.`,
    )
  })

  it('replays from the start', () => {
    const { container } = render(<AiScoreConsole copy={en.aiScore.console} lang="en" run={run} />)
    act(() => intersect?.([{ isIntersecting: true }]))
    expect(container.querySelector('.ai-console')).toHaveAttribute('data-step', '5')
    fireEvent.click(screen.getByRole('button', { name: en.aiScore.console.replay }))
    // Reduced motion jumps straight back to the final step; the run counter still restarted.
    expect(container.querySelector('.ai-console')).toHaveAttribute('data-step', '5')
  })

  it('formats the German summary with German numbers and labels, and names the decisions in German', () => {
    const german = recordedRun(deAiScore.labels)
    render(<AiScoreConsole copy={de.aiScore.console} lang="de" run={german} />)
    act(() => intersect?.([{ isIntersecting: true }]))
    expect(screen.getByRole('img')).toHaveAccessibleName(new RegExp(`${recorded.judgements.length} Punkte .* ${recorded.score.shown} ± ${recorded.score.band}, ${de.aiScore.console.levels[german.level]}\\.`))
    expect(screen.getByText(deAiScore.labels.gates.boundary.name)).toBeInTheDocument()
    expect(screen.getByText(deAiScore.labels.outcomes.fail)).toBeInTheDocument()
  })
})
