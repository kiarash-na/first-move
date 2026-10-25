// @vitest-environment node
import { describe, expect, it } from 'vitest'
import common from '@/dictionaries/de/common.json'
import de from '@/dictionaries/de/landing.json'
import deAiScore from '@/dictionaries/de/ai-score.json'
import { recordedRun } from '@/lib/presentation/blind-test/recorded-run'
import Home from './_components/Home'
import { LandingSwitch } from './_components/LandingSwitch'
import { MobileLanding } from './_components/mobile/MobileLanding'
import Page from './page'

describe('landing page', () => {
  it('renders the switch with the desktop Home and the mobile landing, both with the landing strings', async () => {
    const page = await Page({ params: Promise.resolve({ lang: 'de' }) } as PageProps<'/[lang]'>)
    expect(page.type).toBe(LandingSwitch)

    const desktop = page.props.desktop
    expect(desktop.type).toBe(Home)
    expect(desktop.props.lang).toBe('de')
    // The German landing copy (D-32).
    expect(desktop.props.t.meta.title).toBe(de.meta.title)
    expect(desktop.props.t.closing.getStarted.primary).toBe(de.closing.getStarted.primary)
    expect(desktop.props.t.hero.intro).toBe(de.hero.intro)
    expect(desktop.props.language.label).toBe(common.language.label)

    const mobile = page.props.mobile
    expect(mobile.type).toBe(MobileLanding)
    expect(mobile.props.lang).toBe('de')
    expect(mobile.props.t).toBe(desktop.props.t)
    expect(mobile.props.t.mobile.hero.visualLabel).toBe(de.mobile.hero.visualLabel)
    expect(mobile.props.language).toBe(desktop.props.language)

    // The recorded blind test, once, with its decisions named in German (PLAN-LANDING-POLISH-00 step f).
    expect(desktop.props.run).toEqual(recordedRun(deAiScore.labels))
    expect(mobile.props.run).toBe(desktop.props.run)
  })
})
