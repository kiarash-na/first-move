// @vitest-environment node
import { describe, expect, it } from 'vitest'
import common from '@/dictionaries/de/common.json'
import de from '@/dictionaries/de/landing.json'
import en from '@/dictionaries/en/landing.json'
import Home from './_components/Home'
import Page from './page'

describe('landing page', () => {
  it('passes the landing strings, the language and the language switch copy to Home', async () => {
    const page = await Page({ params: Promise.resolve({ lang: 'de' }) } as PageProps<'/[lang]'>)
    expect(page.type).toBe(Home)
    expect(page.props.lang).toBe('de')
    // German where translated, English otherwise (D-32).
    expect(page.props.t.meta.title).toBe(de.meta.title)
    expect(page.props.t.closing.getStarted.primary).toBe(de.closing.getStarted.primary)
    expect(page.props.t.hero.intro).toBe(en.hero.intro)
    expect(page.props.language.label).toBe(common.language.label)
  })
})
