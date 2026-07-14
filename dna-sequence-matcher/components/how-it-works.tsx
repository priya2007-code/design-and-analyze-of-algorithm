"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AlgoInfo {
  name: string
  best: string
  average: string
  worst: string
  space: string
  color: string
  summary: string
  steps: string[]
}

const ALGORITHMS: AlgoInfo[] = [
  {
    name: "Naive (Brute Force)",
    best: "O(n)",
    average: "O(n·m)",
    worst: "O(n·m)",
    space: "O(1)",
    color: "text-nuc-a",
    summary:
      "Slides the pattern across the text one position at a time and compares characters until a mismatch or a full match.",
    steps: [
      "Align the pattern at position i in the text, starting at i = 0.",
      "Compare pattern characters left-to-right against the text window.",
      "On a mismatch, discard everything learned and shift the pattern by exactly one position.",
      "Repeat for every alignment from 0 to n − m.",
    ],
  },
  {
    name: "Rabin-Karp (Rolling Hash)",
    best: "O(n + m)",
    average: "O(n + m)",
    worst: "O(n·m)",
    space: "O(1)",
    color: "text-nuc-t",
    summary:
      "Hashes the pattern and each text window with a rolling polynomial hash. Only windows whose hash matches the pattern's hash are verified character-by-character.",
    steps: [
      "Compute a polynomial hash of the pattern and of the first window.",
      "Slide the window one step and update the hash in O(1) using the rolling formula.",
      "When a window hash equals the pattern hash, verify the characters to rule out a collision.",
      "Genuine matches are recorded; hash-equal-but-different windows are counted as collisions.",
    ],
  },
  {
    name: "KMP (Knuth-Morris-Pratt)",
    best: "O(n + m)",
    average: "O(n + m)",
    worst: "O(n + m)",
    space: "O(m)",
    color: "text-nuc-g",
    summary:
      "Precomputes a Longest-Prefix-Suffix (LPS) failure table so that after a mismatch it never re-compares characters that are already known to match.",
    steps: [
      "Build the LPS table: lps[i] is the length of the longest proper prefix of pattern[0..i] that is also a suffix.",
      "Scan the text with a single pointer that never moves backwards.",
      "On a mismatch, jump the pattern pointer to lps[j − 1] instead of restarting.",
      "This guarantees every text character is examined a constant number of times.",
    ],
  },
]

function Complexity({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background/40 px-3 py-2">
      <p className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="font-mono text-sm font-semibold">{value}</p>
    </div>
  )
}

export function HowItWorks() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>How pattern matching works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground">
          <p>
            All three algorithms answer the same question — <em>where does a short
            pattern of length</em> <span className="font-mono">m</span>{" "}
            <em>appear inside a longer text of length</em>{" "}
            <span className="font-mono">n</span>? They differ in how much work they
            waste. The naive method throws away information after every mismatch,
            while Rabin-Karp and KMP reuse prior work to approach linear time. On DNA
            — a 4-letter, highly repetitive alphabet — these differences become
            dramatic, especially on pathological inputs like{" "}
            <span className="font-mono">AAAA…AAAT</span>.
          </p>
        </CardContent>
      </Card>

      {ALGORITHMS.map((algo) => (
        <Card key={algo.name}>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className={algo.color}>{algo.name}</CardTitle>
              <Badge variant="outline" className="font-mono">
                worst-case {algo.worst}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {algo.summary}
            </p>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Complexity label="Best" value={algo.best} />
              <Complexity label="Average" value={algo.average} />
              <Complexity label="Worst" value={algo.worst} />
              <Complexity label="Space" value={algo.space} />
            </div>

            <ol className="ml-4 list-decimal space-y-1.5 text-sm leading-relaxed text-muted-foreground marker:text-primary">
              {algo.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
