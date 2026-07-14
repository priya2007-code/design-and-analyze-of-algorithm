"use client"

import type { BenchmarkResult } from "@/lib/dna-algorithms"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// Nucleotide-inspired palette (blue / green / red) resolved to concrete values,
// since CSS variables do not reliably resolve inside Recharts SVG <Cell> fills.
const BAR_COLORS = ["#3b82f6", "#22c55e", "#ef4444"]

function ChartCard({
  title,
  unit,
  data,
  formatter,
}: {
  title: string
  unit: string
  data: { name: string; value: number }[]
  formatter: (v: number) => string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-1 text-sm font-medium text-card-foreground">{title}</h3>
      <p className="mb-4 text-xs text-muted-foreground">{unit}</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={64}
              tickFormatter={(v) => formatter(Number(v))}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                color: "var(--popover-foreground)",
                fontSize: "0.8rem",
              }}
              formatter={(v: number) => [formatter(v), title]}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function BenchmarkChart({ results }: { results: BenchmarkResult[] }) {
  const timeData = results.map((r) => ({ name: r.algorithm, value: r.timeMs }))
  const comparisonData = results.map((r) => ({
    name: r.algorithm,
    value: r.comparisons,
  }))

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ChartCard
        title="Execution Time"
        unit="Average milliseconds per run (lower is better)"
        data={timeData}
        formatter={(v) => (v < 1 ? v.toFixed(3) : v.toFixed(2))}
      />
      <ChartCard
        title="Character Comparisons"
        unit="Total comparisons performed (lower is better)"
        data={comparisonData}
        formatter={(v) =>
          v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toLocaleString()
        }
      />
    </div>
  )
}
