"use client"

// components/keys/TypedRole.tsx
//
// The hero's role line: what the keys above it type out. The name is the input,
// struck on keycaps; this is the output, in mono with a caret, typed the moment the
// name has finished — so the hero has one display voice (the keys) instead of two
// competing ones.
//
// The full line is in the server HTML and stays there for assistive tech; only the
// visible copy types. It reserves its final size from the start (an invisible full
// copy underneath), so typing never shifts the layout. Under reduced motion, or
// while the 3D layer covers the page, it simply shows the whole line.

import { useEffect, useState } from "react"

import { useDomPaused } from "@/components/portfolio-dom/DomActivity"

import { useReducedMotion } from "./Chrome"

export type RoleSegment = { text: string; tone?: "dim" | "neon" }

type Props = {
  segments: RoleSegment[]
  /** Wait this long before typing — the name's keystrokes, so the two read in order. */
  delayMs: number
}

/** Per character. A touch quicker than the keycaps: output, not effort. */
const TYPE_MS = 48

export function TypedRole({ segments, delayMs }: Props) {
  const full = segments.map((s) => s.text).join("")
  const [count, setCount] = useState(full.length)
  const reduced = useReducedMotion()
  const paused = useDomPaused()

  useEffect(() => {
    if (reduced || paused) return
    let i = 0
    let interval = 0
    // Blanked in a callback, not the effect body, then typed back in.
    const blank = window.setTimeout(() => setCount(0), 0)
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        i += 1
        setCount(i)
        if (i >= full.length) window.clearInterval(interval)
      }, TYPE_MS)
    }, delayMs)
    return () => {
      window.clearTimeout(blank)
      window.clearTimeout(start)
      window.clearInterval(interval)
    }
  }, [full, delayMs, reduced, paused])

  // Slice the coloured segments to the first `count` characters.
  const starts = segments.map((_, i) =>
    segments.slice(0, i).reduce((n, s) => n + s.text.length, 0)
  )
  const shown = segments.map((s, i) => (
    <span key={i} className={s.tone ? `role--${s.tone}` : undefined}>
      {s.text.slice(0, Math.max(0, count - starts[i]))}
    </span>
  ))

  return (
    <p className="role">
      <span className="role__prompt" aria-hidden="true">
        ›
      </span>
      <span className="role__line">
        <span className="sr-only">{full}</span>
        {/* Holds the final size so typing never moves anything below it. */}
        <span className="role__ghost" aria-hidden="true">
          {full}
        </span>
        <span className="role__typed" aria-hidden="true">
          {shown}
          <span className="role__caret" />
        </span>
      </span>
    </p>
  )
}
