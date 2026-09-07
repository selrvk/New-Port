"use client"

// components/laptop/lib/useProgressEffect.ts
//
// Drives DOM from the scroll-progress ref without re-rendering React.
//
// The progress value changes every frame; routing that through state would
// re-render the tree 60 times a second. Instead the callback writes styles
// directly, and only runs when the value has actually moved.

import { useCallback, useEffect, useRef, useState } from "react"

export function useProgressEffect(
  progressRef: React.RefObject<number>,
  apply: (progress: number) => void,
  epsilon = 0.0005
): void {
  const applyRef = useRef(apply)

  // Assigned in an effect, not during render: refs must not be written while
  // rendering, and the raf loop below only ever reads it after commit anyway.
  useEffect(() => {
    applyRef.current = apply
  }, [apply])

  useEffect(() => {
    let raf = 0
    let last = Number.NaN

    const tick = () => {
      const p = progressRef.current ?? 0
      if (Number.isNaN(last) || Math.abs(p - last) > epsilon) {
        last = p
        applyRef.current(p)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progressRef, epsilon])
}

/**
 * Scramble-in text effect that is safe to hydrate.
 *
 * The original version seeded useState with random characters, so the server and
 * the client rendered different text and React threw a hydration mismatch. This
 * renders the real text on the server and during the first client paint, then
 * scrambles only after mount — where a mismatch is impossible.
 */
export function useScramble(target: string, startDelay = 300, enabled = true): string {
  const [output, setOutput] = useStateSafe(target)

  useEffect(() => {
    if (!enabled) {
      setOutput(target)
      return
    }
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%"
    const randomChar = () => chars[Math.floor(Math.random() * chars.length)]
    const total = 20
    let frame = 0
    let interval: ReturnType<typeof setInterval> | undefined

    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        frame++
        setOutput(
          target
            .split("")
            .map((char, i) => {
              if (char === " " || char === "-") return char
              if (i < (frame / total) * target.length) return char
              return randomChar()
            })
            .join("")
        )
        if (frame >= total) {
          clearInterval(interval)
          setOutput(target)
        }
      }, 42)
    }, startDelay)

    return () => {
      clearTimeout(timeout)
      if (interval) clearInterval(interval)
    }
  }, [target, startDelay, enabled, setOutput])

  return output
}

/** Tiny indirection so the setter identity is stable for the effect dependency. */
function useStateSafe(initial: string): [string, (v: string) => void] {
  const [value, set] = useState(initial)
  const stable = useCallback((v: string) => set(v), [])
  return [value, stable]
}
