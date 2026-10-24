import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import { THIRD_PARTY } from "@/lib/legal/third-party"

/** The packages First Move ships, with their licences (the `third-party` section of the Licence page). */
export function ThirdPartyTable({ copy }: { copy: Dictionary<"legal">["thirdParty"] }) {
  return (
    <Table scrollLabel={copy.caption} className="min-w-[36rem] text-sm">
      <TableHeader>
        <TableRow>
          <TableHead scope="col">{copy.package}</TableHead>
          <TableHead scope="col">{copy.license}</TableHead>
          <TableHead scope="col">{copy.role}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {THIRD_PARTY.map((entry) => (
          <TableRow key={entry.name}>
            <TableCell className="font-mono text-xs text-foreground">
              <a href={entry.url} rel="noopener noreferrer" className="underline decoration-1 underline-offset-4 hover:text-cool">
                {entry.name}
              </a>
            </TableCell>
            <TableCell className="font-mono text-xs text-text-secondary">{entry.license}</TableCell>
            <TableCell className="text-text-secondary">{entry.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
