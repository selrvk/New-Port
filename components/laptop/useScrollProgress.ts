"use client"

// components/laptop/useScrollProgress.ts
//
// The single 0→1 value the entire experience is a function of.
//
// Deliberately a ref, not React state: this changes every frame, and re-rendering
// the React tree 60 times a second would be ruinous. The 3D scene reads the ref
// inside useFrame; DOM that needs it reads the same ref from its own rAF.
//
// Sampled per frame rather than driven by scroll events. Events are coalesced,
// throttled, and in some embedded/automated browsers barely fire at all, which
// leaves the scene lagging behind or frozen at the position it last heard about.
// `window.scrollY` is a cached value that does not force layout, so reading it
// every frame is cheap and always correct.

import { useCallback, useEffect, useRef } from "react"

export type ProgressRef = React.RefObject<number>

/** Raw document scroll position mapped to 0→1. */
export function readScrollProgress(): number {
  if (typeof window === "undefined") return 0
  const doc = document.documentElement
  const max = doc.scrollHeight - window.innerHeight
  if (max <= 0) return 0
  const p = window.scrollY / max
  return p < 0 ? 0 : p > 1 ? 1 : p
}

export function useScrollProgress(): ProgressRef {
  const ref = useRef(0)

  useEffect(() => {
    ref.current = readScrollProgress()

    let raf = 0
    const tick = () => {
      ref.current = readScrollProgress()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // Belt and braces: a resize changes scrollHeight, and this keeps the value
    // correct on the frame the layout changes rather than one frame later.
    const onResize = () => {
      ref.current = readScrollProgress()
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return ref
}

/**
 * Scrolls the page so that scroll progress lands on `target`.
 * Used by the Projects tab raycasting and by any in-page navigation.
 */
export function useScrollToProgress() {
  return useCallback((target: number, behavior: ScrollBehavior = "smooth") => {
    const doc = document.documentElement
    const max = doc.scrollHeight - window.innerHeight
    if (max <= 0) return
    window.scrollTo({ top: Math.max(0, Math.min(1, target)) * max, behavior })
  }, [])
}
