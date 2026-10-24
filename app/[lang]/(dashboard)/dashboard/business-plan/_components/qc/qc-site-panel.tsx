"use client"

import { CheckIcon, PlusIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatEnergy, formatHectares, formatNumber, formatSquareMeters } from "@/lib/i18n/format"
import { explainResult } from "@/lib/quick-check"
import { CalcInfo } from "../../../_components/how-we-calculate"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { useStore, useStoreState } from "../../../_components/store-provider"
import { QcFigure } from "./qc-figure"
import { QcFrame } from "./qc-frame"
import { QcUnavailable } from "./qc-unavailable"
import { useQcPrefill } from "./use-qc-prefill"
import { useSourcesSentence } from "./use-sources-sentence"

const HEAT_SOURCES = "businessPlan.opportunity.heatSources"

/**
 * BM-STEP-01 · the shared site, buildings and sources and the Quick Check demand, read-only
 * (ALG-09, D-27). Each number has the "How we calculate" popover (D-33). With the Quick Check
 * off, a link to it takes the place of the numbers.
 */
export function QcSitePanel() {
  const lang = useLocale()
  const bp = useDictionary("business-plan")
  const store = useStore()
  const prefill = useQcPrefill()
  const heatSources = useStoreState((state) => state.active?.businessPlan.opportunity.heatSources ?? "")
  const sentence = useSourcesSentence(prefill?.shared ?? { totalBuildings: null, areaM2: null, sources: [] })
  const qc = useDictionary("quick-check")
  if (!prefill) return null

  const frame = { id: "qc-site", title: bp.qc.title, lead: bp.qc.leadSite, readOnlyLabel: bp.qc.readOnly }
  if (prefill.status === "off") {
    return (
      <QcFrame {...frame}>
        <QcUnavailable prefill={prefill} />
      </QcFrame>
    )
  }

  const { shared } = prefill
  const added = sentence !== null && heatSources.includes(sentence)

  return (
    <QcFrame {...frame}>
      <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
        <QcFigure label={bp.qc.buildings} value={formatNumber(shared.totalBuildings, lang)} />
        <QcFigure
          label={bp.qc.area}
          value={formatSquareMeters(shared.areaM2, lang)}
          note={shared.areaM2 === null ? null : formatHectares(shared.areaM2, lang)}
        />
        {prefill.status === "ready" && (
          <>
            <QcFigure
              label={bp.qc.heatingDemand}
              value={formatEnergy(prefill.numbers.heatingDemandKwh, lang, { perYear: true })}
              info={<CalcInfo source={explainResult("heatingDemandKwh", prefill.numbers.flags)} label={bp.qc.heatingDemand} />}
            />
            <QcFigure
              label={bp.qc.coolingDemand}
              value={formatEnergy(prefill.numbers.coolingDemandKwh, lang, { perYear: true })}
              info={<CalcInfo source={explainResult("coolingDemandKwh", prefill.numbers.flags)} label={bp.qc.coolingDemand} />}
            />
          </>
        )}
      </dl>
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">{bp.qc.sources}</p>
        {shared.sources.length === 0 ? (
          <p className="text-sm text-text-secondary">{bp.qc.noSources}</p>
        ) : (
          <ul className="flex flex-wrap items-center gap-2">
            {shared.sources.map(({ source, potential }) => (
              <li key={source}>
                <Badge variant="secondary">
                  {qc.sources[source].label} · {qc.potentials[potential].label}
                </Badge>
              </li>
            ))}
            <li>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={added}
                onClick={() => {
                  if (!sentence) return
                  store.patch({ [HEAT_SOURCES]: heatSources.trim() === "" ? sentence : `${heatSources}\n${sentence}` })
                }}
              >
                {added ? <CheckIcon strokeWidth={1.6} aria-hidden="true" /> : <PlusIcon strokeWidth={1.6} aria-hidden="true" />}
                {added ? bp.qc.sourcesAdded : bp.qc.useSources}
              </Button>
            </li>
          </ul>
        )}
      </div>
      {prefill.status === "incomplete" && <QcUnavailable prefill={prefill} />}
    </QcFrame>
  )
}
