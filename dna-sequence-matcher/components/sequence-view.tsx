"use client"

import { useMemo } from "react"

const NUC_CLASS: Record<string, string> = {
  A: "text-nuc-a",
  T: "text-nuc-t",
  C: "text-nuc-c",
  G: "text-nuc-g",
}

const RENDER_LIMIT = 8000

interface SequenceViewProps {
  sequence: string
  matches: number[]
  patternLength: number
}

interface Segment {
  text: string
  matched: boolean
  start: number
}

function buildSegments(
  sequence: string,
  matches: number[],
  patternLength: number,
  limit: number,
): { segments: Segment[]; truncated: boolean } {
  const truncated = sequence.length > limit
  const view = truncated ? sequence.slice(0, limit) : sequence
  const n = view.length

  // Mark every position covered by a match (handles overlapping matches).
  const covered = new Uint8Array(n)
  for (const start of matches) {
    if (start >= n) continue
    const end = Math.min(start + patternLength, n)
    for (let i = start; i < end; i++) covered[i] = 1
  }

  const segments: Segment[] = []
  let i = 0
  while (i < n) {
    const matched = covered[i] === 1
    let j = i
    while (j < n && covered[j] === 1 === matched) j++
    segments.push({ text: view.slice(i, j), matched, start: i })
    i = j
  }
  return { segments, truncated }
}

export function SequenceView({ sequence, matches, patternLength }: SequenceViewProps) {
  const { segments, truncated } = useMemo(
    () => buildSegments(sequence, matches, patternLength, RENDER_LIMIT),
    [sequence, matches, patternLength],
  )

  if (sequence.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No sequence to display. Enter or generate a DNA sequence.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <div className="max-h-72 overflow-auto rounded-md border border-border bg-background/50 p-3">
        <p className="break-all font-mono text-sm leading-7 tracking-wide">
          {segments.map((seg, idx) =>
            seg.matched ? (
              <span
                key={idx}
                className="rounded-sm bg-primary/25 px-0.5 py-0.5 font-semibold ring-1 ring-primary/50"
                title={`Match at position ${seg.start}`}
              >
                {seg.text.split("").map((ch, k) => (
                  <span key={k} className={NUC_CLASS[ch]}>
                    {ch}
                  </span>
                ))}
              </span>
            ) : (
              <span key={idx} className="text-muted-foreground">
                {seg.text}
              </span>
            ),
          )}
        </p>
      </div>
      {truncated && (
        <p className="text-xs text-muted-foreground">
          Showing the first {RENDER_LIMIT.toLocaleString()} of{" "}
          {sequence.length.toLocaleString()} bases for readability. Match counts and
          benchmarks still use the full sequence.
        </p>
      )}
    </div>
  )
}

export function NucleotideLegend() {
  const items: { base: string; label: string; color: string }[] = [
    { base: "A", label: "Adenine", color: "var(--nuc-a)" },
    { base: "T", label: "Thymine", color: "var(--nuc-t)" },
    { base: "C", label: "Cytosine", color: "var(--nuc-c)" },
    { base: "G", label: "Guanine", color: "var(--nuc-g)" },
  ]
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((it) => (
        <div
          key={it.base}
          className="flex items-center gap-2 rounded-full border border-border bg-background/60 py-1 pl-1 pr-3"
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full font-mono text-sm font-bold text-background"
            style={{ backgroundColor: it.color }}
          >
            {it.base}
          </span>
          <span className="text-xs text-muted-foreground">{it.label}</span>
        </div>
      ))}
    </div>
  )
}
