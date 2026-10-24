"use client"

import { AlertTriangleIcon, ArrowRightIcon, ShieldAlertIcon } from "lucide-react"
import Link from "next/link"

import { topRisks } from "@/lib/dashboard/overview"
import { dashboardHref } from "@/lib/dashboard/routes"
import type { Project } from "@/lib/project"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { BpTile } from "./bp-tile"

/** The top three risks (BM-STEP-03.3/4), the potential deal-breaker first, flagged with icon and text. */
export function RisksTile({ project }: { project: Project }) {
  const lang = useLocale()
  const copy = useDictionary("overview").bp
  const risks = topRisks(project, 3)
  const href = dashboardHref(lang, { page: "business-plan", step: "reality-check" })

  return (
    <BpTile id="risks" icon={ShieldAlertIcon} title={copy.risks.title}>
      {risks.length > 0 ? (
        <ol className="flex flex-col divide-y border-y">
          {risks.map((risk, index) => (
            <li key={risk.id} data-risk={risk.id} className="flex items-start gap-3 py-3 text-[15px] leading-snug">
              <span className="pt-0.5 font-mono text-xs text-muted-foreground tabular-nums">{String(index + 1).padStart(2, "0")}</span>
              <span className="flex min-w-0 flex-col gap-1.5">
                <span className="text-pretty">{risk.title}</span>
                {risk.dealBreaker && (
                  <span className="inline-flex w-fit items-center gap-1.5 border border-hot px-1.5 py-0.5 font-mono text-xs tracking-[0.06em] text-hot uppercase">
                    <AlertTriangleIcon className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
                    {copy.dealBreaker.tag}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm leading-relaxed text-text-secondary">{copy.risks.none}</p>
      )}
      <Link href={href} className="group mt-auto inline-flex min-h-11 items-center gap-2 font-mono text-xs tracking-[0.06em] text-hot uppercase">
        {risks.length > 0 ? copy.open : copy.risks.add}
        <ArrowRightIcon className="size-4 transition-transform duration-[180ms] group-hover:translate-x-0.5" strokeWidth={1.6} aria-hidden="true" />
      </Link>
    </BpTile>
  )
}
