"use client"

import type { BenchmarkResult } from "@/lib/dna-algorithms"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

function formatTime(ms: number): string {
  if (ms < 0.001) return "<0.001"
  if (ms < 1) return ms.toFixed(4)
  return ms.toFixed(3)
}

export function ResultsTable({ results }: { results: BenchmarkResult[] }) {
  const fastest = Math.min(...results.map((r) => r.timeMs))
  const fewestComparisons = Math.min(...results.map((r) => r.comparisons))

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Algorithm</TableHead>
            <TableHead className="text-right">Time (ms, avg)</TableHead>
            <TableHead className="text-right">Comparisons</TableHead>
            <TableHead className="text-right">Matches</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((r) => (
            <TableRow key={r.algorithm}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {r.algorithm}
                  {r.timeMs === fastest && (
                    <Badge variant="secondary" className="text-nuc-t">
                      fastest
                    </Badge>
                  )}
                </div>
                {typeof r.collisions === "number" && r.collisions > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {r.collisions} hash collision{r.collisions === 1 ? "" : "s"}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatTime(r.timeMs)}
              </TableCell>
              <TableCell
                className={`text-right font-mono tabular-nums ${
                  r.comparisons === fewestComparisons ? "text-nuc-t" : ""
                }`}
              >
                {r.comparisons.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {r.matches.length.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
