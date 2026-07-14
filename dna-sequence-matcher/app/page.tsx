import { Dna } from "lucide-react"
import { DnaMatcher } from "@/components/dna-matcher"
import { DnaHelix } from "@/components/dna-helix"

export default function Page() {
  return (
    <main className="relative min-h-svh bg-background">
      {/* Molecular grid backdrop */}
      <div
        className="pointer-events-none fixed inset-0 dna-grid-bg"
        aria-hidden="true"
      />

      <header className="relative overflow-hidden border-b border-border bg-card/40">
        {/* Animated helix strip */}
        <DnaHelix
          className="pointer-events-none absolute inset-x-0 top-0 h-full w-full opacity-40"
          rungs={32}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" aria-hidden="true" />

        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30 shadow-[0_0_24px_-4px_var(--primary)]">
              <Dna className="size-6 text-primary" />
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-widest text-primary">
                  Bioinformatics Lab
                </span>
              </div>
              <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-4xl">
                DNA Sequence Matcher
              </h1>
              <p className="mt-1 max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">
                Compare <span className="text-nuc-a font-medium">Naive</span>,{" "}
                <span className="text-nuc-t font-medium">Rabin-Karp</span>, and{" "}
                <span className="text-nuc-g font-medium">KMP</span> string-matching
                algorithms as they hunt a pattern through a genome.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <DnaMatcher />
      </div>
    </main>
  )
}
