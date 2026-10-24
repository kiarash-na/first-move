import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import type { QuickCheckFlags } from "@/lib/quick-check"
import { I18nProvider } from "../i18n-provider"
import { testDictionaries } from "../test-utils/dictionaries"
import { NetworkLengthTag } from "./network-length-tag"

const flags = (manual: boolean) => ({ manualNetworkLength: manual, estimatedNetworkLength: !manual }) as QuickCheckFlags

describe("NetworkLengthTag (QCT-KF-07)", () => {
  it.each([
    [true, quickCheck.ui.results.network.manual, quickCheck.ui.results.network.manualHint],
    [false, quickCheck.ui.results.network.estimated, quickCheck.ui.results.network.estimatedHint],
  ])("says whether the length was entered (%s)", (manual, tag, hint) => {
    render(
      <I18nProvider lang="en" dictionaries={testDictionaries("en")}>
        <NetworkLengthTag flags={flags(manual)} withHint />
      </I18nProvider>,
    )
    expect(screen.getByText(tag)).toBeInTheDocument()
    expect(screen.getByText(hint)).toBeInTheDocument()
  })
})
