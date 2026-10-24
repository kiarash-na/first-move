"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ECONOMIC_PARAMETER_INFO, ECONOMIC_PARAMETERS } from "@/lib/project"
import { lookup } from "@/lib/i18n/lookup"
import { economicTableValue } from "@/lib/quick-check/reference"
import { useDictionary } from "../../_components/i18n-provider"
import { OverrideCell } from "./override-cell"

/**
 * TBL-6 economic parameters: default, unit and the open question a row is flagged with
 * (ambient air installation cost = 0, OQ-18). Read-only unless playing (D-10).
 */
export function EconomicTable({ playing }: { playing: boolean }) {
  const copy = useDictionary("assumptions")
  const quickCheck = useDictionary("quick-check")
  return (
    <div data-slot="economic-table" className="flex flex-col gap-3">
      <h3 className="flex flex-wrap items-baseline gap-x-2 text-base font-[480]">
        <span className="font-mono text-xs tracking-[0.06em] text-muted-foreground">TBL-6</span>
        {copy.tables["TBL-6"].title}
      </h3>
      <div className="border bg-card">
        <Table scrollLabel={`TBL-6 ${copy.tables["TBL-6"].title}`}>
          <TableHeader>
            <TableRow>
              <TableHead>{copy.tables.parameter}</TableHead>
              <TableHead className="text-right">{playing ? copy.tables.custom : copy.tables.value}</TableHead>
              <TableHead>{copy.tables.unitColumn}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ECONOMIC_PARAMETERS.map((key) => {
              const info = ECONOMIC_PARAMETER_INFO[key]
              const label = quickCheck.parameters[key].label
              const help = lookup(quickCheck.parameters, `${key}.help`)
              const flag = info.flags.includes("OQ-18") ? copy.flags["OQ-18"] : null
              return (
                <TableRow key={key} data-parameter={key}>
                  <TableCell className="whitespace-normal">
                    <span className="flex min-w-[12rem] flex-col gap-0.5">
                      <span className="font-[480]">{label}</span>
                      {(flag ?? help) && <span className="text-xs leading-snug text-muted-foreground">{flag ?? help}</span>}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <OverrideCell
                      fieldId={`quickCheck.overrides.economic.${key}`}
                      defaultValue={economicTableValue(key) ?? (flag ? 0 : null)}
                      label={label}
                      playing={playing}
                      dash={copy.tables.dash}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{info.unit}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
