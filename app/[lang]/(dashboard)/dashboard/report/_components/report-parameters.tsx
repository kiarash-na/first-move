"use client"

import { CapacityTable } from "../../_components/assumptions/capacity-table"
import { EconomicTable } from "../../_components/assumptions/economic-table"

/**
 * The parameters behind the figures: Tables 4 and 5 (capacity and COP per source) and Table 6
 * (economics), read-only, with any value changed on the Assumptions page marked as custom (D-10).
 */
export function ReportParameters() {
  return (
    <div data-slot="report-parameters" className="flex flex-col gap-8">
      <CapacityTable application="heating" playing={false} />
      <CapacityTable application="cooling" playing={false} />
      <EconomicTable playing={false} />
    </div>
  )
}
