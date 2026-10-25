import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { MobileAiScore } from './MobileAiScore'

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} unobserve() {} })
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {}, removeEventListener() {} }))
})
afterEach(() => vi.unstubAllGlobals())

describe('MobileAiScore', () => {
  it('is the ai-score chapter with the three facts, the route, the docs page and the step to the methodology', () => {
    render(<MobileAiScore t={en} lang="de" />)
    expect(document.getElementById('m-ai-score')).toHaveAttribute('aria-labelledby', 'm-ai-score-title')
    for (const fact of en.aiScore.facts) {
      expect(screen.getByText(fact.label)).toBeInTheDocument()
      expect(screen.getByText(fact.title)).toBeInTheDocument()
      expect(screen.getByText(fact.text)).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: en.aiScore.primary })).toHaveAttribute('href', '/de/dashboard/ai-score')
    expect(screen.getByRole('link', { name: en.aiScore.secondary })).toHaveAttribute('href', '/de/docs/ai-plan-score')
    expect(screen.getByRole('link', { name: en.aiScore.link })).toHaveAttribute('href', '#m-methodology')
    expect(screen.getByRole('button', { name: en.aiScore.console.replay })).toBeInTheDocument()
  })
})
