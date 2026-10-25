import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { MobileTools } from './MobileTools'

describe('MobileTools', () => {
  it('leads to the Quick Check, the Business Models and the AI Plan Score chapters', () => {
    render(<MobileTools t={en} />)
    const { quickCheck, businessModels, aiScore } = en.product.tools
    expect(screen.getByRole('link', { name: new RegExp(quickCheck.title) })).toHaveAttribute('href', '#m-quick-check')
    expect(screen.getByRole('link', { name: new RegExp(businessModels.title) })).toHaveAttribute('href', '#m-business-models')
    expect(screen.getByRole('link', { name: new RegExp(aiScore.title) })).toHaveAttribute('href', '#m-ai-score')
    for (const tool of [quickCheck, businessModels, aiScore]) {
      expect(screen.getByText(tool.subtitle)).toBeInTheDocument()
      expect(screen.getByText(tool.meta)).toBeInTheDocument()
    }
  })
})
