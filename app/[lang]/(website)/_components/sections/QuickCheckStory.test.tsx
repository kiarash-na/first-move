import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { QuickCheckStory } from './QuickCheckStory'

describe('landing QuickCheckStory', () => {
  it('renders the preview inputs and the three-level assessment from the dictionary', () => {
    render(<QuickCheckStory t={en} onPreviewChange={() => {}} />)
    expect(screen.getByRole('group', { name: en.quickCheck.assessment.scaleLabel })).toBeInTheDocument()
    expect(screen.getAllByText(en.quickCheck.assessment.states.promising.label).length).toBeGreaterThan(0)
  })
})
