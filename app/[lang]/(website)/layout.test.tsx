// @vitest-environment node
import { describe, expect, it } from 'vitest'
import de from '@/dictionaries/de/landing.json'
import en from '@/dictionaries/en/landing.json'
import WebsiteLayout, { generateMetadata, generateStaticParams } from './layout'

const props = (lang: string) => ({ params: Promise.resolve({ lang }) }) as LayoutProps<'/[lang]'>

describe('website layout', () => {
  it('localizes the metadata from the landing dictionary', async () => {
    expect(await generateMetadata(props('en'))).toEqual({ title: en.meta.title, description: en.meta.description })
    expect(await generateMetadata(props('de'))).toEqual({ title: de.meta.title, description: de.meta.description })
  })

  it('prerenders both locales', () => {
    expect(generateStaticParams()).toEqual([{ lang: 'en' }, { lang: 'de' }])
  })

  it('renders a dark html root in the page language', async () => {
    const root = await WebsiteLayout({ ...props('de'), children: null })
    expect(root.type).toBe('html')
    expect(root.props).toMatchObject({ lang: 'de', 'data-theme': 'dark' })
  })
})
