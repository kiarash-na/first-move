"use client"

import { Badge } from "@/components/ui/badge"
import { formatEur } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { explainResult } from "@/lib/quick-check"
import { CalcInfo } from "../../../_components/how-we-calculate"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { QcFigure } from "./qc-figure"
import { QcFrame } from "./qc-frame"
import { QcUnavailable } from "./qc-unavailable"
import { useQcPrefill } from "./use-qc-prefill"

/**
 * BM-STEP-03 · the rough Quick Check revenue and investment, read-only (ALG-09, D-27), with the
 * "How we calculate" popover on each (D-33). With the Quick Check off, a link takes their place.
 */
export function QcEconomicsPanel() {
  const lang = useLocale()
  const bp = useDictionary("business-plan")
  const prefill = useQcPrefill()
  if (!prefill) return null

  return (
    <QcFrame id="qc-economics" title={bp.qc.title} lead={bp.qc.leadEconomics} readOnlyLabel={bp.qc.readOnly}>
      {prefill.status === "ready" ? (
        <>
          <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <QcFigure
              label={bp.qc.revenue}
              value={interpolate(bp.qc.perYear, { value: formatEur(prefill.numbers.overallRevenue, lang, { compact: true }) })}
              info={<CalcInfo source={explainResult("overallRevenue", prefill.numbers.flags)} label={bp.qc.revenue} />}
            />
            <QcFigure
              label={bp.qc.investment}
              value={formatEur(prefill.numbers.overallInvestment, lang, { compact: true })}
              info={<CalcInfo source={explainResult("overallInvestment", prefill.numbers.flags)} label={bp.qc.investment} />}
            />
          </dl>
          <div className="flex flex-wrap items-center gap-3">
            {prefill.numbers.flags.customParameters && <Badge variant="hot">{bp.qc.customParameters}</Badge>}
            <p className="text-sm text-muted-foreground">{bp.qc.screeningNote}</p>
          </div>
        </>
      ) : (
        <QcUnavailable prefill={prefill} />
      )}
    </QcFrame>
  )
}
