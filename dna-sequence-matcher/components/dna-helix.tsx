"use client"

import { useMemo } from "react"

const STRAND_COLORS = ["var(--nuc-a)", "var(--nuc-t)", "var(--nuc-c)", "var(--nuc-g)"]

interface DnaHelixProps {
  /** Number of base-pair rungs to render. */
  rungs?: number
  className?: string
}

/**
 * A decorative, animated horizontal double-helix strip.
 * Two sine-wave strands cross over one another with colored base-pair rungs
 * that pulse in sequence — purely visual, marked aria-hidden.
 */
export function DnaHelix({ rungs = 28, className }: DnaHelixProps) {
  const width = 800
  const height = 80
  const amp = 26
  const midY = height / 2

  const { top, bottom, ticks } = useMemo(() => {
    const top: string[] = []
    const bottom: string[] = []
    const ticks: {
      x: number
      y1: number
      y2: number
      color: string
      delay: number
      front: boolean
    }[] = []

    // Round to 2 decimals so server and client render byte-identical SVG
    // coordinates (avoids React hydration mismatches from float precision).
    const round = (n: number) => Math.round(n * 100) / 100

    const steps = 120
    for (let i = 0; i <= steps; i++) {
      const x = round((i / steps) * width)
      const phase = (i / steps) * Math.PI * 6
      top.push(`${x},${round(midY + Math.sin(phase) * amp)}`)
      bottom.push(`${x},${round(midY - Math.sin(phase) * amp)}`)
    }

    for (let r = 0; r < rungs; r++) {
      const t = r / (rungs - 1)
      const x = round(t * width)
      const phase = t * Math.PI * 6
      const y1 = round(midY + Math.sin(phase) * amp)
      const y2 = round(midY - Math.sin(phase) * amp)
      ticks.push({
        x,
        y1,
        y2,
        color: STRAND_COLORS[r % STRAND_COLORS.length],
        delay: round((r / rungs) * 2),
        // Rung is "in front" when the top strand is below the mid line.
        front: Math.sin(phase) > 0,
      })
    }
    return { top: top.join(" "), bottom: bottom.join(" "), ticks }
  }, [rungs])

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      {/* Base-pair rungs */}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x}
          y1={t.y1}
          x2={t.x}
          y2={t.y2}
          stroke={t.color}
          strokeWidth={t.front ? 3 : 2}
          strokeLinecap="round"
          opacity={t.front ? 0.9 : 0.35}
          className="dna-rung"
          style={{ animationDelay: `${t.delay}s` }}
        />
      ))}
      {/* Two backbones */}
      <polyline
        points={top}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={2.5}
        strokeLinecap="round"
        opacity={0.85}
      />
      <polyline
        points={bottom}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={2.5}
        strokeLinecap="round"
        opacity={0.5}
      />
    </svg>
  )
}
