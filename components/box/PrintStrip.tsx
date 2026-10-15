"use client"

// components/box/PrintStrip.tsx
//
// The scroll indicator: the colour control strip printed in the margin of every
// packaging sheet. One patch per face of the box (FACES); a patch prints when its
// face reaches the middle of the screen.
//
// Stands down entirely in two cases:
//   · prefers-reduced-motion — rendered fully printed, and no scroll listener is
//     ever attached. Motion has an off switch, not a slower setting.
//   · the 3D layer is covering the page (useDomPaused) — nothing to indicate, and
//     no reason to listen to a scroll that drives the laptop instead.

import { useEffect, useState, useSyncExternalStore } from "react"

import { useDomPaused } from "@/components/portfolio-dom/DomActivity"

import { FACES } from "./faces"

/** Ink densities, as a real two-colour strip alternates them. */
const TONES = ["100", "70", "40", "spot"] as const

const REDUCED = "(prefers-reduced-motion: reduce)"
function subscribeReduced(onChange: () => void) {
  const mq = window.matchMedia(REDUCED)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}
const getReduced = () => window.matchMedia(REDUCED).matches
const getReducedServer = () => false

export function PrintStrip() {
  const paused = useDomPaused()
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, getReducedServer)
  const [reached, setReached] = useState(0)

  useEffect(() => {
    if (paused || reduced) return
    const sections = FACES.map((f) => document.getElementById(f.id)).filter(
      (el): el is HTMLElement => el !== null
    )
    let raf = 0
    const measure = () => {
      raf = 0
      const line = window.innerHeight * 0.5
      let n = 0
      for (const s of sections) if (s.getBoundingClientRect().top <= line) n++
      // Short final faces can never reach the middle of a tall screen; at the very
      // bottom of the page everything has been seen.
      const doc = document.documentElement
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) n = sections.length
      setReached(n)
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    schedule()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [paused, reduced])

  if (paused) return null
  const printed = reduced ? FACES.length : reached

  return (
    <div className="box-strip" aria-hidden="true">
      {FACES.map((f, i) => (
        <span
          key={f.id}
          className="box-strip__patch"
          data-tone={TONES[i % TONES.length]}
          data-printed={i < printed ? "" : undefined}
        />
      ))}
    </div>
  )
}
