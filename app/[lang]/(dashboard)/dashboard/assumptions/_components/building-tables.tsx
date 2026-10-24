"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EMPTY_VALUE, formatNumber } from "@/lib/i18n/format"
import { BUILDING_TYPES, CONSTRUCTION_PERIODS } from "@/lib/project"
import { buildingTableValue, type BuildingTable } from "@/lib/quick-check/reference"
import { useDictionary, useLocale } from "../../_components/i18n-provider"

const TABLES: BuildingTable[] = ["TBL-1", "TBL-2", "TBL-3"]

/** TBL-1..3 read-only (D-10): demand per m² and floor area per type and period; dashes for industry (OQ-02). */
export function BuildingTables() {
  const lang = useLocale()
  const copy = useDictionary("assumptions").tables
  const quickCheck = useDictionary("quick-check")
  return (
    <Tabs defaultValue="TBL-1" data-slot="building-tables">
      <TabsList className="max-w-full overflow-x-auto">
        {TABLES.map((table) => (
          <TabsTrigger key={table} value={table} className="gap-2">
            <span className="text-muted-foreground">{table}</span>
            <span className="max-sm:sr-only">{copy[table].title}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {TABLES.map((table) => (
        <TabsContent key={table} value={table} className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground sm:hidden">{copy[table].title} · </span>
            {copy[table].unit}
          </p>
          <div className="border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{copy.type}</TableHead>
                  {CONSTRUCTION_PERIODS.map((period) => (
                    <TableHead key={period} className="text-right normal-case">
                      {quickCheck.periods[period].label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {BUILDING_TYPES.map((type) => (
                  <TableRow key={type}>
                    <TableCell className="font-[480]">{quickCheck.buildingTypes[type].label}</TableCell>
                    {CONSTRUCTION_PERIODS.map((period) => {
                      const value = buildingTableValue(table, type, period)
                      return (
                        <TableCell key={period} className="text-right font-mono tabular-nums">
                          {value === null ? (
                            <span title={copy.dash}>
                              <span aria-hidden="true">{EMPTY_VALUE}</span>
                              <span className="sr-only">{copy.dash}</span>
                            </span>
                          ) : (
                            formatNumber(value, lang)
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
