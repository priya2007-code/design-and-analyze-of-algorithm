export type AlgorithmName = "Naive" | "Rabin-Karp" | "KMP"

export interface SearchResult {
  /** 0-indexed positions where the pattern was found */
  matches: number[]
  /** number of character comparisons performed */
  comparisons: number
  /** extra algorithm-specific info (e.g. hash collisions) */
  collisions?: number
}

export interface BenchmarkResult extends SearchResult {
  algorithm: AlgorithmName
  /** average execution time in milliseconds across all iterations */
  timeMs: number
  /** number of iterations averaged */
  iterations: number
}

const NUCLEOTIDES = ["A", "T", "C", "G"] as const

/* -------------------------------------------------------------------------- */
/*                                 Validation                                 */
/* -------------------------------------------------------------------------- */

/** Uppercase input and strip everything that is not A/T/C/G. */
export function sanitizeDna(input: string): string {
  return input.toUpperCase().replace(/[^ATCG]/g, "")
}

/** Returns the list of invalid characters found in the raw input (post-uppercase). */
export function findInvalidChars(input: string): string[] {
  const invalid = new Set<string>()
  for (const ch of input.toUpperCase()) {
    if (ch.trim() === "") continue
    if (!NUCLEOTIDES.includes(ch as (typeof NUCLEOTIDES)[number])) {
      invalid.add(ch)
    }
  }
  return [...invalid]
}

/* -------------------------------------------------------------------------- */
/*                               Naive Search                                 */
/* -------------------------------------------------------------------------- */

/**
 * Brute-force sliding window. For every alignment i, compares characters until
 * a mismatch or a full match. Worst case O(n*m).
 */
export function naiveSearch(text: string, pattern: string): SearchResult {
  const matches: number[] = []
  let comparisons = 0
  const n = text.length
  const m = pattern.length
  if (m === 0 || m > n) return { matches, comparisons }

  for (let i = 0; i <= n - m; i++) {
    let j = 0
    while (j < m) {
      comparisons++
      if (text[i + j] !== pattern[j]) break
      j++
    }
    if (j === m) matches.push(i)
  }
  return { matches, comparisons }
}

/* -------------------------------------------------------------------------- */
/*                               Rabin-Karp                                   */
/* -------------------------------------------------------------------------- */

/**
 * Rolling-hash search. Computes a polynomial hash of the pattern and each
 * window; when hashes match it verifies character-by-character. Tracks the
 * number of hash collisions (hash matched but strings differed).
 * Average O(n+m), worst case O(n*m) on adversarial hashing.
 */
export function rabinKarpSearch(text: string, pattern: string): SearchResult {
  const matches: number[] = []
  let comparisons = 0
  let collisions = 0
  const n = text.length
  const m = pattern.length
  if (m === 0 || m > n) return { matches, comparisons, collisions }

  const BASE = 4 // alphabet size (A,T,C,G)
  const MOD = 1_000_000_007
  const code: Record<string, number> = { A: 0, T: 1, C: 2, G: 3 }

  // highestPow = BASE^(m-1) % MOD, used to remove the leading digit.
  let highestPow = 1
  for (let i = 0; i < m - 1; i++) highestPow = (highestPow * BASE) % MOD

  let patternHash = 0
  let windowHash = 0
  for (let i = 0; i < m; i++) {
    patternHash = (patternHash * BASE + code[pattern[i]]) % MOD
    windowHash = (windowHash * BASE + code[text[i]]) % MOD
  }

  for (let i = 0; i <= n - m; i++) {
    if (windowHash === patternHash) {
      // Verify character by character to guard against collisions.
      let j = 0
      while (j < m) {
        comparisons++
        if (text[i + j] !== pattern[j]) break
        j++
      }
      if (j === m) matches.push(i)
      else collisions++ // hash matched but the strings did not
    }

    // Roll the hash forward one position.
    if (i < n - m) {
      windowHash =
        ((windowHash - code[text[i]] * highestPow) * BASE + code[text[i + m]]) % MOD
      // JS modulo can be negative; normalise back into range.
      if (windowHash < 0) windowHash += MOD
    }
  }
  return { matches, comparisons, collisions }
}

/* -------------------------------------------------------------------------- */
/*                                   KMP                                      */
/* -------------------------------------------------------------------------- */

/**
 * Builds the Longest-Prefix-Suffix (failure) table for the pattern.
 * lps[i] = length of the longest proper prefix of pattern[0..i] that is also a suffix.
 */
export function buildLps(pattern: string): number[] {
  const m = pattern.length
  const lps = new Array<number>(m).fill(0)
  let len = 0
  let i = 1
  while (i < m) {
    if (pattern[i] === pattern[len]) {
      len++
      lps[i] = len
      i++
    } else if (len > 0) {
      len = lps[len - 1]
    } else {
      lps[i] = 0
      i++
    }
  }
  return lps
}

/**
 * Knuth-Morris-Pratt search. Uses the LPS table to skip re-comparing characters
 * that are known to match, guaranteeing O(n+m) even on pathological inputs.
 */
export function kmpSearch(
  text: string,
  pattern: string,
): SearchResult & { lps: number[] } {
  const matches: number[] = []
  let comparisons = 0
  const n = text.length
  const m = pattern.length
  if (m === 0 || m > n) return { matches, comparisons, lps: [] }

  const lps = buildLps(pattern)
  let i = 0 // index into text
  let j = 0 // index into pattern

  while (i < n) {
    comparisons++
    if (text[i] === pattern[j]) {
      i++
      j++
      if (j === m) {
        matches.push(i - j)
        j = lps[j - 1]
      }
    } else if (j > 0) {
      j = lps[j - 1]
    } else {
      i++
    }
  }
  return { matches, comparisons, lps }
}

/* -------------------------------------------------------------------------- */
/*                               Benchmarking                                 */
/* -------------------------------------------------------------------------- */

const RUNNERS: Record<AlgorithmName, (t: string, p: string) => SearchResult> = {
  Naive: naiveSearch,
  "Rabin-Karp": rabinKarpSearch,
  KMP: kmpSearch,
}

/**
 * Runs a single algorithm `iterations` times and averages the wall-clock time.
 * Comparisons/matches are deterministic so we only need to capture them once.
 */
export function benchmarkAlgorithm(
  algorithm: AlgorithmName,
  text: string,
  pattern: string,
  iterations: number,
): BenchmarkResult {
  const runner = RUNNERS[algorithm]

  // Capture deterministic results once.
  const result = runner(text, pattern)

  // Time multiple iterations for stable measurements on short inputs.
  const start = performance.now()
  for (let k = 0; k < iterations; k++) {
    runner(text, pattern)
  }
  const elapsed = performance.now() - start

  return {
    algorithm,
    matches: result.matches,
    comparisons: result.comparisons,
    collisions: result.collisions,
    timeMs: elapsed / iterations,
    iterations,
  }
}

export function runAllBenchmarks(
  text: string,
  pattern: string,
  iterations: number,
): BenchmarkResult[] {
  return (["Naive", "Rabin-Karp", "KMP"] as AlgorithmName[]).map((name) =>
    benchmarkAlgorithm(name, text, pattern, iterations),
  )
}

/* -------------------------------------------------------------------------- */
/*                          Synthetic sequence tools                          */
/* -------------------------------------------------------------------------- */

/** Uniformly random A/T/C/G string of the given length. */
export function generateRandomDna(length: number): string {
  const out = new Array<string>(length)
  for (let i = 0; i < length; i++) {
    out[i] = NUCLEOTIDES[(Math.random() * 4) | 0]
  }
  return out.join("")
}

/**
 * Pathological "AAAA...AAAB" style input that maximises redundant comparisons
 * for the naive algorithm while KMP stays linear.
 */
export function generatePathologicalDna(length: number): string {
  if (length <= 0) return ""
  return "A".repeat(length - 1) + "T"
}

/** A good pathological pattern to pair with generatePathologicalDna. */
export const PATHOLOGICAL_PATTERN = "AAAAAAAAAT"
