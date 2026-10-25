import type { LanguageSwitchProps } from '@/components/language-switch/language-switch'
import type { LandingCopyProps } from '../types'
import './mobile.css'
import { MobileAiScore } from './MobileAiScore'
import { MobileAssessment } from './MobileAssessment'
import { MobileCanvas } from './MobileCanvas'
import { MobileFooter } from './MobileFooter'
import { MobileGetStarted } from './MobileGetStarted'
import { MobileHeader } from './MobileHeader'
import { MobileHero } from './MobileHero'
import { MobileImplementation } from './MobileImplementation'
import { MobileMethodology } from './MobileMethodology'
import { MobilePromise } from './MobilePromise'
import { MobileQuickInputs } from './MobileQuickInputs'
import { MobileRealityCheck } from './MobileRealityCheck'
import { MobileReport } from './MobileReport'
import { MobileRevealRoot } from './MobileRevealRoot'
import { MobileScalability } from './MobileScalability'
import { MobileTools } from './MobileTools'
import { MobileUseCases } from './MobileUseCases'

export interface MobileLandingProps extends LandingCopyProps {
  language: Omit<LanguageSwitchProps, 'lang' | 'className'>
}

/**
 * The phone and tablet landing (PLAN-LANDING-MOBILE-00): the desktop story's chapters in the same
 * order and with the same copy, in one column (two on tablets where it helps), without the 3D
 * scene and the scroll machinery. Shown below 1024 px by `LandingSwitch`.
 */
export function MobileLanding({ t, lang, language }: MobileLandingProps) {
  return (
    <MobileRevealRoot>
      <MobileHeader t={t} lang={lang} language={language} />
      <main className="m-main">
        <MobileHero t={t} />
        <MobilePromise t={t} />
        <MobileTools t={t} />
        <MobileQuickInputs t={t} />
        <MobileAssessment t={t} />
        <MobileReport t={t} />
        <MobileUseCases t={t} />
        <MobileCanvas t={t} />
        <MobileRealityCheck t={t} />
        <MobileScalability t={t} />
        <MobileImplementation t={t} />
        <MobileAiScore t={t} lang={lang} />
        <MobileMethodology t={t} />
        <MobileGetStarted t={t} lang={lang} />
      </main>
      <MobileFooter t={t} lang={lang} />
    </MobileRevealRoot>
  )
}
