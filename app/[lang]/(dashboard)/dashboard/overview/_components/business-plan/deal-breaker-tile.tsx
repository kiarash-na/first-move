"use client"

import { ArrowRightIcon, OctagonAlertIcon } from "lucide-react"
import Link from "next/link"

import { dealBreaker } from "@/lib/dashboard/overview"
import { dashboardHref } from "@/lib/dashboard/routes"
import type { Project } from "@/lib/project"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { BpTile } from "./bp-tile"

/** The one risk that could stop the project (BM-STEP-03.3/4), or a nudge to name it. */
export function DealBreakerTile({ project }: { project: Project }) {
  const lang = useLocale()
  const copy = useDictionary("overview").bp
  const risk = dealBreaker(project)
  const href = dashboardHref(lang, { page: "business-plan", step: "reality-check" })

  return (
    <BpTile id="dealBreaker" icon={OctagonAlertIcon} title={copy.dealBreaker.title}>
      {risk ? (
        <p data-risk={risk.id} className="text-[clamp(22px,2vw,28px)] leading-[1.12] font-[540] tracking-[-0.035em] text-pretty [font-stretch:88%]">
          {risk.title}
        </p>
      ) : (
        <p className="text-sm leading-relaxed text-text-secondary">{copy.dealBreaker.none}</p>
      )}
      <Link href={href} className="group mt-auto inline-flex min-h-11 items-center gap-2 font-mono text-xs tracking-[0.06em] text-hot uppercase">
        {risk ? copy.open : copy.dealBreaker.mark}
        <ArrowRightIcon className="size-4 transition-transform duration-[180ms] group-hover:translate-x-0.5" strokeWidth={1.6} aria-hidden="true" />
      </Link>
    </BpTile>
  )
}
