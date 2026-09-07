"use client"

// components/laptop/hud/ScrollHint.tsx
//
// A scroll affordance plus a live section readout. The whole page is one scroll
// range with no visible section breaks, so without this there is no signal that
// scrolling is what drives everything.
//
// It runs vertically down the right edge, which matches what it measures: the bar
// fills downward exactly as the page scrolls down.

import { useRef } from "react"

import { SECTIONS, SECTION_ORDER, type SectionId } from "../config"
import { smoothstep } from "../lib/keyframes"
import { useProgressEffect } from "../lib/useProgressEffect"

const LABELS: Record<SectionId, string> = {
  hero: "intro",
  projects: "projects",
  skills: "skills",
  certifications: "certifications",
  schools: "education",
  about: "about",
  languages: "languages",
  contact: "contact",
}

type Props = { progressRef: React.RefObject<number> }

export function ScrollHint({ progressRef }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const cueRef = useRef<HTMLDivElement>(null)
  const current = useRef<SectionId | null>(null)

  useProgressEffect(progressRef, (p) => {
    if (barRef.current) barRef.current.style.transform = `scaleY(${p.toFixed(4)})`

    // The "scroll" cue is only useful before the user has scrolled.
    if (cueRef.current) cueRef.current.style.opacity = String(1 - smoothstep(0.002, 0.02, p))

    let id: SectionId = SECTION_ORDER[SECTION_ORDER.length - 1]
    for (const s of SECTION_ORDER) {
      if (p >= SECTIONS[s].start && p < SECTIONS[s].end) {
        id = s
        break
      }
    }
    if (id !== current.current) {
      current.current = id
      if (labelRef.current) labelRef.current.textContent = LABELS[id]
    }
  })

  return (
    <div className="scroll-hint" ref={rootRef} aria-hidden="true">
      <span className="scroll-hint__label" ref={labelRef}>
        intro
      </span>
      <div className="scroll-hint__track">
        <div className="scroll-hint__bar" ref={barRef} />
      </div>
      <div className="scroll-hint__cue" ref={cueRef}>
        <span>scroll</span>
        <span className="scroll-hint__arrow">↓</span>
      </div>
    </div>
  )
}
