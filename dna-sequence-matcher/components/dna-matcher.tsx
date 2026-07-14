"use client"

import { useMemo, useState, useTransition } from "react"
import {
  Dna,
  FlaskConical,
  Play,
  Shuffle,
  Zap,
  TriangleAlert,
  BookOpen,
  BarChart3,
} from "lucide-react"

import {
  type BenchmarkResult,
  findInvalidChars,
  generatePathologicalDna,
  generateRandomDna,
  PATHOLOGICAL_PATTERN,
  runAllBenchmarks,
  sanitizeDna,
} from "@/lib/dna-algorithms"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

import { NucleotideLegend, SequenceView } from "@/components/sequence-view"
import { ResultsTable } from "@/components/results-table"
import { BenchmarkChart } from "@/components/benchmark-chart"
import { HowItWorks } from "@/components/how-it-works"

const SIZES = [1000, 10000, 100000]

const DEFAULT_SEQUENCE =
  "GCTAGCTAGGCTATTAGCTAGCTAGCGCTAAGCTAGGGCTATCGATCGCTAGCTAGCGCTAGCTAGCTAAGCTAGCTAGGCTA"
const DEFAULT_PATTERN = "GCTA"

interface RunMeta {
  sequenceLength: number
  patternLength: number
  iterations: number
}

export function DnaMatcher() {
  const [sequence, setSequence] = useState(DEFAULT_SEQUENCE)
  const [pattern, setPattern] = useState(DEFAULT_PATTERN)
  const [iterations, setIterations] = useState(100)
  const [sizeIndex, setSizeIndex] = useState(1)

  const [results, setResults] = useState<BenchmarkResult[] | null>(null)
  const [runMeta, setRunMeta] = useState<RunMeta | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [tab, setTab] = useState("matcher")
  const [isPending, startTransition] = useTransition()

  const invalidInSequence = useMemo(() => findInvalidChars(sequence), [sequence])
  const invalidInPattern = useMemo(() => findInvalidChars(pattern), [pattern])

  function handleSequenceChange(value: string) {
    setSequence(sanitizeDna(value))
  }

  function handlePatternChange(value: string) {
    setPattern(sanitizeDna(value))
  }

  function handleGenerateRandom() {
    const size = SIZES[sizeIndex]
    setSequence(generateRandomDna(size))
    setNotice(
      `Generated a random ${size.toLocaleString()}-base sequence. Run the comparison to benchmark it.`,
    )
    setError(null)
  }

  function handleGeneratePathological() {
    const size = SIZES[sizeIndex]
    setSequence(generatePathologicalDna(size))
    setPattern(PATHOLOGICAL_PATTERN)
    setNotice(
      `Generated a pathological ${size.toLocaleString()}-base sequence (AAAA…AAAT) with pattern ${PATHOLOGICAL_PATTERN}. This maximises redundant work for the Naive algorithm.`,
    )
    setError(null)
  }

  function handleRun() {
    setNotice(null)
    if (sequence.length === 0) {
      setError("Please enter or generate a DNA sequence.")
      return
    }
    if (pattern.length === 0) {
      setError("Please enter a pattern to search for.")
      return
    }
    if (pattern.length > sequence.length) {
      setError("The pattern is longer than the sequence — no matches are possible.")
      return
    }
    setError(null)

    // Defer heavy work so the UI can paint the pending state first.
    startTransition(() => {
      const res = runAllBenchmarks(sequence, pattern, iterations)
      setResults(res)
      setRunMeta({
        sequenceLength: sequence.length,
        patternLength: pattern.length,
        iterations,
      })
    })
  }

  const matchPositions = results?.[0]?.matches ?? []
  const canShowResults = results !== null && runMeta !== null

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="mb-6 grid w-full grid-cols-3 sm:w-auto sm:inline-flex">
        <TabsTrigger value="matcher" className="gap-1.5">
          <Dna className="size-4" /> Matcher
        </TabsTrigger>
        <TabsTrigger value="benchmark" className="gap-1.5">
          <BarChart3 className="size-4" /> Benchmark
        </TabsTrigger>
        <TabsTrigger value="how" className="gap-1.5">
          <BookOpen className="size-4" /> How It Works
        </TabsTrigger>
      </TabsList>

      {/* ------------------------------- Matcher ------------------------------ */}
      <TabsContent value="matcher" className="mt-0">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="size-5 text-primary" /> Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sequence">DNA Sequence</Label>
                    <span className="font-mono text-xs text-muted-foreground">
                      {sequence.length.toLocaleString()} bases
                    </span>
                  </div>
                  <Textarea
                    id="sequence"
                    value={sequence}
                    onChange={(e) => handleSequenceChange(e.target.value)}
                    placeholder="Paste a long A/T/C/G sequence…"
                    className="min-h-32 resize-y font-mono text-sm tracking-wide"
                    spellCheck={false}
                  />
                  {invalidInSequence.length > 0 && (
                    <p className="text-xs text-destructive">
                      Ignored invalid characters:{" "}
                      {invalidInSequence.map((c) => `"${c}"`).join(", ")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pattern">Pattern</Label>
                  <Input
                    id="pattern"
                    value={pattern}
                    onChange={(e) => handlePatternChange(e.target.value)}
                    placeholder="e.g. GCTA"
                    className="font-mono tracking-widest"
                    spellCheck={false}
                  />
                  {invalidInPattern.length > 0 && (
                    <p className="text-xs text-destructive">
                      Ignored invalid characters:{" "}
                      {invalidInPattern.map((c) => `"${c}"`).join(", ")}
                    </p>
                  )}
                </div>

                <NucleotideLegend />

                {error && (
                  <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <TriangleAlert className="size-4 shrink-0" />
                    {error}
                  </div>
                )}
                {notice && !error && (
                  <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground">
                    {notice}
                  </div>
                )}

                <Button
                  onClick={handleRun}
                  disabled={isPending}
                  size="lg"
                  className="w-full gap-2 sm:w-auto"
                >
                  <Play className="size-4" />
                  {isPending ? "Running…" : "Run Comparison"}
                </Button>
              </CardContent>
            </Card>

            {canShowResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                    <span>Matched Sequence</span>
                    <Badge variant="secondary">
                      {matchPositions.length.toLocaleString()} match
                      {matchPositions.length === 1 ? "" : "es"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SequenceView
                    sequence={sequence}
                    matches={matchPositions}
                    patternLength={runMeta.patternLength}
                  />

                  <div>
                    <p className="mb-2 text-sm font-medium">
                      Match positions (0-indexed)
                    </p>
                    {matchPositions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No occurrences of the pattern were found.
                      </p>
                    ) : (
                      <div className="flex max-h-40 flex-wrap gap-1.5 overflow-auto rounded-md border border-border bg-background/40 p-2">
                        {matchPositions.slice(0, 500).map((pos) => (
                          <span
                            key={pos}
                            className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-secondary-foreground"
                          >
                            {pos}
                          </span>
                        ))}
                        {matchPositions.length > 500 && (
                          <span className="px-1.5 py-0.5 text-xs text-muted-foreground">
                            +{(matchPositions.length - 500).toLocaleString()} more…
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {canShowResults && (
              <Card>
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResultsTable results={results} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* ----------------------------- Controls ---------------------------- */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shuffle className="size-4 text-primary" /> Synthetic Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Sequence size</Label>
                    <span className="font-mono text-sm font-semibold text-primary">
                      {SIZES[sizeIndex].toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[sizeIndex]}
                    onValueChange={(v) =>
                      setSizeIndex(Array.isArray(v) ? v[0] : v)
                    }
                    min={0}
                    max={SIZES.length - 1}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {SIZES.map((s) => (
                      <span key={s}>{s >= 1000 ? `${s / 1000}k` : s}</span>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Button
                    variant="secondary"
                    onClick={handleGenerateRandom}
                    className="gap-2"
                  >
                    <Shuffle className="size-4" /> Random sequence
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleGeneratePathological}
                    className="gap-2"
                  >
                    <Zap className="size-4" /> Pathological case
                  </Button>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  The pathological case builds an{" "}
                  <span className="font-mono">AAAA…AAAT</span> sequence that forces
                  the Naive algorithm to re-compare characters repeatedly, while KMP
                  stays linear.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Timing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Iterations</Label>
                  <span className="font-mono text-sm font-semibold text-primary">
                    {iterations}
                  </span>
                </div>
                <Slider
                  value={[iterations]}
                  onValueChange={(v) =>
                    setIterations(Array.isArray(v) ? v[0] : v)
                  }
                  min={1}
                  max={500}
                  step={1}
                />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Each algorithm runs this many times; the reported time is the
                  average. More iterations give more stable timings on short inputs.
                </p>
              </CardContent>
            </Card>

            {canShowResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Last run</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Sequence length</span>
                    <span className="font-mono text-foreground">
                      {runMeta.sequenceLength.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pattern length</span>
                    <span className="font-mono text-foreground">
                      {runMeta.patternLength}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Iterations</span>
                    <span className="font-mono text-foreground">
                      {runMeta.iterations}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </TabsContent>

      {/* ------------------------------ Benchmark ----------------------------- */}
      <TabsContent value="benchmark" className="mt-0">
        {canShowResults ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Comparison table</CardTitle>
              </CardHeader>
              <CardContent>
                <ResultsTable results={results} />
              </CardContent>
            </Card>
            <BenchmarkChart results={results} />
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <BarChart3 className="size-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Run a comparison on the Matcher tab to see benchmark charts here.
              </p>
              <Button variant="secondary" onClick={() => setTab("matcher")}>
                Go to Matcher
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* ------------------------------ How It Works -------------------------- */}
      <TabsContent value="how" className="mt-0">
        <HowItWorks />
      </TabsContent>
    </Tabs>
  )
}
