"use client"

// components/laptop/Keyboard.tsx
//
// Single owner of everything drawn onto the physical keyboard.
//
// Two sections use it, and both do the same thing with it: light keys as something
// is typed. Skills spells out category names; Languages types each input source's
// greeting on a loop. One glow buffer, one set of alignment numbers.
//
// Everything is written every frame, so leaving a section genuinely resets the
// board rather than leaving state behind.
//
// What is deliberately NOT here: relabelling the keycaps per language. That needed
// an opaque overlay plane to cover the legends painted into the model's texture,
// and those patches read as extra keycaps stuck on top of the real ones rather than
// as the same board in another layout. Which keys a layout moves is now said on the
// screen instead — see drawLanguages — where it costs nothing to be wrong about.

import { useFrame } from "@react-three/fiber"
import { useRef } from "react"

import { KEY_COUNT } from "@/data/keyboard"

import { Keycaps } from "./Keycaps"
import { SECTIONS } from "./config"
import { computeGreetingGlow, languageSlot } from "./languages/greeting"
import { localProgress } from "./lib/keyframes"
import { computeGlow } from "./skills/glow"

type Props = {
  progressRef: React.RefObject<number>
}

export function Keyboard({ progressRef }: Props) {
  const glowRef = useRef(new Float32Array(KEY_COUNT))

  useFrame(() => {
    const p = progressRef.current ?? 0
    const glow = glowRef.current

    const skills = SECTIONS.skills
    const langs = SECTIONS.languages

    if (p >= skills.start && p < skills.end) {
      computeGlow(localProgress(p, skills.start, skills.end), glow)
      return
    }

    if (p >= langs.start && p < langs.end) {
      // The selected language types its greeting, on a loop. The same call drives
      // the preview field on screen, so the lit key and the letter that appears are
      // guaranteed to be the same character. See languages/greeting.ts for why this
      // one thing is allowed to run on a clock.
      const slot = languageSlot(localProgress(p, langs.start, langs.end))
      computeGreetingGlow(slot.language.greeting, performance.now(), glow)
      return
    }

    glow.fill(0)
  })

  return <Keycaps glowRef={glowRef} />
}
