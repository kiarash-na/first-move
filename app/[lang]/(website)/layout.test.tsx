// @vitest-environment node
import { describe, expect, it } from 'vitest'
import de from '@/dictionaries/de/landing.json'
import en from '@/dictionaries/en/landing.json'
import WebsiteLayout, { generateMetadata, generateStaticParams } from './layout'

const props = (lang: string) => ({ params: Promise.resolve({ lang }) }) as LayoutProps<'/[lang]'>

describe('website layout', () => {
  it('localizes the metadata from the landing dictionary', async () => {
    const BASE = 'https://www.firstmove.energy'
    expect(await generateMetadata(props('en'))).toEqual({
      title: en.meta.title,
      description: en.meta.description,
      metadataBase: new URL(BASE),
      alternates: {
        canonical: `${BASE}/en`,
        languages: { en: `${BASE}/en`, de: `${BASE}/de`, 'x-default': `${BASE}/de` },
      },
      openGraph: {
        type: 'website',
        siteName: 'First Move',
        url: `${BASE}/en`,
        locale: 'en_US',
        alternateLocale: 'de_DE',
        images: [{ url: '/en/opengraph-image', width: 1200, height: 630, alt: 'First Move' }],
      },
      twitter: { card: 'summary_large_image' },
    })
    expect(await generateMetadata(props('de'))).toMatchObject({
      title: de.meta.title,
      description: de.meta.description,
      alternates: { canonical: `${BASE}/de` },
      openGraph: { locale: 'de_DE', alternateLocale: 'en_US' },
    })
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
