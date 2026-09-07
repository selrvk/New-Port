"use client"

// components/laptop/Keyboard.tsx
//
// Single owner of everything drawn onto the physical keyboard.
//
// Two sections use it — Skills lights keys as it spells category names, Languages
// relabels them per input source — and they share one glow buffer and one legend
// overlay. Letting each section mount its own Keycaps would put two additive layers
// on the same keys and two sets of alignment numbers to keep in step.
//
// Everything is written every frame from scroll progress, so leaving a section
// genuinely resets the board rather than leaving state behind.

import { useFrame } from "@react-three/fiber"
import { useRef } from "react"

import { KEY_COUNT, KEY_INDEX } from "@/data/keyboard"
import { changedKeys, languages } from "@/data/languages"

import { KeyLegends, type LegendState } from "./KeyLegends"
import { Keycaps } from "./Keycaps"
import { SECTIONS } from "./config"
import { clamp01, localProgress } from "./lib/keyframes"
import { computeGlow } from "./skills/glow"

type Props = {
  progressRef: React.RefObject<number>
}

/** How sharply the just-remapped keys stop being highlighted. */
const REMAP_DECAY = 5

export function Keyboard({ progressRef }: Props) {
  const glowRef = useRef(new Float32Array(KEY_COUNT))
  const legendRef = useRef<LegendState>({
    overrides: {},
    highlight: 0,
    changed: new Set<string>(),
  })

  useFrame(() => {
    const p = progressRef.current ?? 0
    const glow = glowRef.current
    const legend = legendRef.current

    const skills = SECTIONS.skills
    const langs = SECTIONS.languages

    if (p >= skills.start && p < skills.end) {
      computeGlow(localProgress(p, skills.start, skills.end), glow)
      if (Object.keys(legend.overrides).length) {
        legend.overrides = {}
        legend.changed = new Set()
        legend.highlight = 0
      }
      return
    }

    if (p >= langs.start && p < langs.end) {
      const t = localProgress(p, langs.start, langs.end)
      const raw = t * languages.length
      const index = Math.min(languages.length - 1, Math.floor(raw))
      const frac = clamp01(raw - index)

      const lang = languages[index]
      const previous = index > 0 ? languages[index - 1] : null
      const changed = changedKeys(previous, lang)

      legend.overrides = lang.keycaps
      legend.changed = new Set(changed)
      // Fades as you settle into the language, so the swap is legible but the
      // keyboard is not permanently flashing.
      legend.highlight = Math.exp(-frac * REMAP_DECAY)

      // Only the keys that actually moved light up.
      glow.fill(0)
      for (const id of changed) {
        const i = KEY_INDEX[id]
        if (i !== undefined) glow[i] = 0.4 + 1.5 * legend.highlight
      }
      return
    }

    glow.fill(0)
    if (Object.keys(legend.overrides).length) {
      legend.overrides = {}
      legend.changed = new Set()
      legend.highlight = 0
    }
  })

  return (
    <>
      <KeyLegends stateRef={legendRef} />
      <Keycaps glowRef={glowRef} />
    </>
  )
}
