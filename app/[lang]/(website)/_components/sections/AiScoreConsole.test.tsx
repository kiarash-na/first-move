import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import de from '@/dictionaries/de/landing.json'
import { AiScoreConsole } from './AiScoreConsole'
import { EXAMPLE_TURNS } from './aiScoreExample'

type Callback = (entries: { isIntersecting: boolean }[]) => void
let intersect: Callback | null = null

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
  it('renders the four turns with their 27 cells and one decision each, from the dictionary', () => {
    const { container } = render(<AiScoreConsole copy={en.aiScore.console} lang="en" />)
    for (const turn of EXAMPLE_TURNS) {
      expect(screen.getByText(en.aiScore.console.turns[turn.turn])).toBeInTheDocument()
      expect(screen.getByText(en.aiScore.console.decisions[turn.turn].name)).toBeInTheDocument()
    }
    expect(container.querySelectorAll('.ai-turn__cells i')).toHaveLength(27)
    expect(container.querySelectorAll('.ai-dimensions li')).toHaveLength(7)
    expect(screen.getByText(en.aiScore.console.evidence[4])).toBeInTheDocument()
    expect(container.querySelector('.ai-console')).toHaveAttribute('data-step', '0')
  })

  it('shows the score once the console is in view, and the summary names it for assistive technology', () => {
    const { container } = render(<AiScoreConsole copy={en.aiScore.console} lang="en" />)
    act(() => intersect?.([{ isIntersecting: true }]))
    expect(container.querySelector('.ai-console')).toHaveAttribute('data-step', '5')
    expect(container.querySelector('.ai-result__number')).toHaveTextContent('60')
    expect(container.querySelector('.ai-result__band')).toHaveTextContent('±6')
    expect(container.querySelector('.ai-result__level')).toHaveTextContent(en.aiScore.console.levels.promising)
    expect(screen.getByRole('img')).toHaveAccessibleName('An example run: 27 fields scored in four turns, a score of 60 ± 6, Promising.')
  })

  it('replays from the start', () => {
    const { container } = render(<AiScoreConsole copy={en.aiScore.console} lang="en" />)
    act(() => intersect?.([{ isIntersecting: true }]))
    expect(container.querySelector('.ai-console')).toHaveAttribute('data-step', '5')
    fireEvent.click(screen.getByRole('button', { name: en.aiScore.console.replay }))
    // Reduced motion jumps straight back to the final step; the run counter still restarted.
    expect(container.querySelector('.ai-console')).toHaveAttribute('data-step', '5')
  })

  it('formats the German summary with German numbers and labels', () => {
    render(<AiScoreConsole copy={de.aiScore.console} lang="de" />)
    act(() => intersect?.([{ isIntersecting: true }]))
    expect(screen.getByRole('img')).toHaveAccessibleName(/27 Felder .* 60 ± 6, Vielversprechend\./)
  })
})
