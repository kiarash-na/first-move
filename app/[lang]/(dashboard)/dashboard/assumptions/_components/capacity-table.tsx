"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { interpolate } from "@/lib/i18n/interpolate"
import { CAPACITY_CELLS, hasCell, SOURCES, type Application } from "@/lib/project"
import { capacityTableValue } from "@/lib/quick-check/reference"
import { useDictionary } from "../../_components/i18n-provider"
import { OverrideCell } from "./override-cell"

const TABLE = { heating: "TBL-4", cooling: "TBL-5" } as const

/**
 * TBL-4 (heating) or TBL-5 (cooling): capacity per potential level in kWh/a and the COP per
 * source. Read-only unless playing (D-10); dashes have no default and stay fixed (OQ-13).
 */
export function CapacityTable({ application, playing }: { application: Application; playing: boolean }) {
  const copy = useDictionary("assumptions")
  const quickCheck = useDictionary("quick-check")
  const table = TABLE[application]
  return (
    <div data-slot="capacity-table" data-table={table} className="flex flex-col gap-3">
      <h3 className="flex flex-wrap items-baseline gap-x-2 text-base font-[480]">
        <span className="font-mono text-xs tracking-[0.06em] text-muted-foreground">{table}</span>
        {copy.tables[table].title}
        <span className="text-sm text-muted-foreground">· {copy.tables[table].unit}</span>
      </h3>
      <div className="border bg-card">
        <Table scrollLabel={`${table} ${copy.tables[table].title}`}>
          <TableHeader>
            <TableRow>
              <TableHead>{copy.tables.source}</TableHead>
              {CAPACITY_CELLS.map((cell) => (
                <TableHead key={cell} className="text-right">
                  {quickCheck.capacityCells[cell].label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {SOURCES.map((source) => (
              <TableRow key={source}>
                <TableCell className="font-[480]">{quickCheck.sources[source].label}</TableCell>
                {CAPACITY_CELLS.map((cell) => (
                  <TableCell key={cell} className="text-right">
                    <OverrideCell
                      fieldId={hasCell(source, application, cell) ? `quickCheck.overrides.${application}.${source}.${cell}` : null}
                      defaultValue={capacityTableValue(application, source, cell)}
                      label={interpolate(copy.playground.cell, {
                        row: `${table} ${quickCheck.sources[source].label}`,
                        column: quickCheck.capacityCells[cell].label,
                      })}
                      playing={playing}
                      dash={copy.tables.dash}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
