"use client"

// components/laptop/PerfGovernor.tsx
//
// Measures frame time and drops the render resolution if the machine cannot keep up.
//
// This exists because PERF already declared `fpsFloor`, `degradedDpr` and
// `degradeAfterMs` — and nothing read them. Config that documents a behaviour it
// does not have is worse than no config at all, so this makes the promise real.
//
// How it decides:
//
//   · Frame times are accumulated into a rolling window rather than judged one at a
//     time. A single 40ms frame means nothing — a GC pause, a texture upload, the
//     compositor. A second of them means the machine is genuinely behind.
//   · The first few frames are ignored. Shader compilation and the first texture
//     uploads happen there, and they are slow on every machine including fast ones.
//   · The decision is ONE-WAY. Once degraded it stays degraded for the session.
//     Recovering would raise dpr, which would drop fps, which would degrade again —
//     a machine sitting near the threshold would oscillate between resolutions,
//     which is far more noticeable than simply running at the lower one.
//
// Changing dpr re-allocates the drawing buffer, so it is done through React state
// on the Canvas rather than by poking the renderer.

import { useFrame, useThree } from "@react-three/fiber"
import { useRef } from "react"

import { PERF } from "./config"

/** Frames skipped before measuring — shader compile and first uploads live here. */
const WARMUP_FRAMES = 40

export type PerfStats = {
  /** Smoothed frames per second. */
  fps: number
  /** Smoothed milliseconds per frame. */
  frameMs: number
  /** Worst single frame seen since load, in ms. */
  worstMs: number
  /** Device pixel ratio currently in use. */
  dpr: number
  /** True once the governor has stepped down. */
  degraded: boolean
}

type Props = {
  /** Mutated in place each frame; read by the debug readout. */
  statsRef: React.RefObject<PerfStats>
  /** Called once, when sustained low fps is confirmed. */
  onDegrade: () => void
  /** Already stepped down — keep measuring, but do not decide again. */
  degraded: boolean
}

export function PerfGovernor({ statsRef, onDegrade, degraded }: Props) {
  const gl = useThree((s) => s.gl)
  const frames = useRef(0)
  const last = useRef(0)
  // Exponential moving average: one number, no ring buffer, no allocation.
  const avgMs = useRef(0)
  /** How long we have been continuously below the floor. */
  const belowMs = useRef(0)
  const fired = useRef(false)

  useFrame(() => {
    // Never measure a hidden document. Browsers throttle rAF hard in a background
    // tab — often to ~1Hz — which looks exactly like a machine that cannot cope.
    // Without this, leaving the tab open in the background would degrade the
    // resolution of a page that was rendering perfectly well. Zeroing `last` makes
    // the first frame after returning a skip, since it would otherwise carry the
    // whole hidden interval.
    if (typeof document !== "undefined" && document.hidden) {
      last.current = 0
      belowMs.current = 0
      return
    }

    const now = performance.now()
    const prev = last.current
    last.current = now

    frames.current += 1
    if (frames.current <= WARMUP_FRAMES || prev === 0) return

    const dt = now - prev
    // Belt and braces alongside the visibility check: any single frame this long is
    // a stall (GC, a driver hitch, the compositor), not a frame rate. Counting it
    // would let one hiccup drag the average under the floor.
    if (dt > 500) return

    avgMs.current = avgMs.current === 0 ? dt : avgMs.current * 0.9 + dt * 0.1

    const stats = statsRef.current
    if (stats) {
      stats.frameMs = avgMs.current
      stats.fps = 1000 / avgMs.current
      if (dt > stats.worstMs) stats.worstMs = dt
      stats.dpr = gl.getPixelRatio()
      stats.degraded = degraded
    }

    if (degraded || fired.current) return

    if (1000 / avgMs.current < PERF.fpsFloor) {
      belowMs.current += dt
      if (belowMs.current >= PERF.degradeAfterMs) {
        fired.current = true
        console.info(
          `[portfolio] sustained ${(1000 / avgMs.current).toFixed(0)}fps — ` +
            `dropping dpr to ${PERF.degradedDpr}`
        )
        onDegrade()
      }
    } else {
      // Must be sustained: any frame back above the floor resets the clock.
      belowMs.current = 0
    }
  })

  return null
}

export function createPerfStats(): PerfStats {
  return { fps: 0, frameMs: 0, worstMs: 0, dpr: 0, degraded: false }
}
