import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import aiScore from '@/dictionaries/en/ai-score.json'
import { recordedRun } from '@/lib/presentation/blind-test/recorded-run'
import { AiScoreStory } from './AiScoreStory'

const run = recordedRun(aiScore.labels)

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} unobserve() {} })
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {}, removeEventListener() {} }))
})
afterEach(() => vi.unstubAllGlobals())

describe('landing AiScoreStory', () => {
  it('is the ai-score chapter with the three facts, and links the route, the docs page and the methodology', () => {
    render(<AiScoreStory t={en} lang="de" run={run} />)
    expect(document.getElementById('ai-score')).toHaveAttribute('data-chapter')
    // jsdom gives the headline's line break no space; browsers do.
    expect(screen.getByRole('heading', { level: 2, name: new RegExp(`^${en.aiScore.title.split('\n')[0].replace('.', '\\.')}`) })).toHaveAttribute('id', 'ai-score-title')
    for (const fact of en.aiScore.facts) expect(screen.getByText(fact.title)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: en.aiScore.primary })).toHaveAttribute('href', '/de/dashboard/ai-score')
    expect(screen.getByRole('link', { name: en.aiScore.secondary })).toHaveAttribute('href', '/de/docs/ai-plan-score')
    expect(screen.getByRole('link', { name: en.aiScore.link })).toHaveAttribute('href', '#methodology')
    expect(screen.getByRole('link', { name: en.aiScore.console.link })).toHaveAttribute('href', '/de/presentation#5')
    expect(screen.getByRole('button', { name: en.aiScore.console.replay })).toBeInTheDocument()
  })
})
