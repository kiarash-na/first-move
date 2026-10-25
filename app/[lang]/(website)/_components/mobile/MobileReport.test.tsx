import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { MobileReport } from './MobileReport'

describe('MobileReport', () => {
  it('shows one example report card, labelled as an example, and continues to the Business Models', () => {
    render(<MobileReport t={en} />)
    const { report, captionDocument, link } = en.quickCheck.results
    expect(document.getElementById('m-results')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: report.title })).toBeInTheDocument()
    for (const text of [report.topLeft, report.topRight, report.result, report.demandValue, report.sourceValue, report.capexValue, report.reason, report.footerLeft]) {
      expect(screen.getByText(text)).toBeInTheDocument()
    }
    expect(screen.getByText(captionDocument)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: link })).toHaveAttribute('href', '#m-business-models')
  })
})
