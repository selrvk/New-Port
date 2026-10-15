"use client"

// components/laptop/ScrollStage.tsx
//
// Owns the fixed, full-viewport canvas (mounted once, never unmounted), the tall
// spacer that gives the page its scroll range, and the DOM that sits over the scene.

import { useProgress } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import * as THREE from "three"

import { HeroHud } from "./hud/HeroHud"
import { ContactInput } from "./hud/ContactInput"
import { ScrollHint } from "./hud/ScrollHint"
import { Scene } from "./Scene"
import { PerfGovernor, createPerfStats } from "./PerfGovernor"
import { CAMERA, PERF, TOTAL_SCROLL_VH } from "./config"
import { reportBootProgress, resetBootProgress } from "./lib/bootProgress"
import { useScrollProgress } from "./useScrollProgress"

type Props = {
  /** Lets the user drop back to the readable, conventional layout. */
  onExit: () => void
  /** Called when the scene is unrecoverable, so we can fall back to static. */
  onFatal: () => void
}

export function ScrollStage({ onExit, onFatal }: Props) {
  const progressRef = useScrollProgress()
  const losses = useRef({ unrecovered: 0, timer: 0 })

  // Changing dpr re-allocates the drawing buffer, so it goes through state on the
  // Canvas rather than being poked into the renderer. One-way: see PerfGovernor.
  const [degraded, setDegraded] = useState(false)
  const perfStats = useRef(createPerfStats())
  const onDegrade = useCallback(() => setDegraded(true), [])
  const debug =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("debug")

  return (
    <>
      {/* Fixed scene. aria-hidden: everything it shows also exists as real DOM. */}
      <div className="laptop-canvas" aria-hidden="true">
        <Canvas
          dpr={degraded ? PERF.degradedDpr : PERF.dpr}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          camera={{
            fov: CAMERA.defaultFov,
            near: CAMERA.near,
            far: CAMERA.far,
            position: [2.3, 1.3, 2.55],
          }}
          onCreated={({ gl, invalidate }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = 1.05

            // A WebGL context can be taken away at any time — GPU sleep, a driver
            // reset, too many live contexts, a long-backgrounded tab. Without
            // handling it the visitor is left staring at a permanently black page.
            // preventDefault() is what allows the browser to restore it at all.
            // A loss that the browser then restores is survivable and must not
            // count against us — only a loss that is never restored is fatal.
            const canvas = gl.domElement
            const onLost = (e: Event) => {
              e.preventDefault()
              console.warn("[portfolio] WebGL context lost — awaiting restore")
              window.clearTimeout(losses.current.timer)
              losses.current.timer = window.setTimeout(() => {
                losses.current.unrecovered += 1
                console.warn(
                  `[portfolio] context not restored (${losses.current.unrecovered})`
                )
                if (losses.current.unrecovered >= 2) onFatal()
              }, 4000)
            }
            const onRestored = () => {
              window.clearTimeout(losses.current.timer)
              console.info("[portfolio] WebGL context restored")
              invalidate()
            }
            canvas.addEventListener("webglcontextlost", onLost)
            canvas.addEventListener("webglcontextrestored", onRestored)
          }}
        >
          <PerfGovernor statsRef={perfStats} onDegrade={onDegrade} degraded={degraded} />
          <Suspense fallback={null}>
            <Scene progressRef={progressRef} debug={debug} statsRef={perfStats} />
            {/* Inside the same boundary, so it cannot mount before the model has. */}
            <ReadySignal />
          </Suspense>
        </Canvas>
      </div>

      {debug ? (
        <pre
          id="scene-debug"
          style={{
            position: "fixed",
            left: 12,
            top: 12,
            zIndex: 60,
            margin: 0,
            padding: "10px 12px",
            background: "rgba(10,10,10,0.9)",
            border: "1px solid #1E1E1E",
            color: "#E8FF47",
            font: "11px/1.5 ui-monospace, Menlo, monospace",
            whiteSpace: "pre",
            pointerEvents: "none",
          }}
        />
      ) : null}

      <ProgressReporter />

      {/* DOM over the scene. */}
      <HeroHud progressRef={progressRef} onExit={onExit} />
      <ScrollHint progressRef={progressRef} />
      <ContactInput />

      {/* Gives the document its scroll range. Everything is a function of this. */}
      <div
        className="laptop-spacer"
        style={{ height: `${TOTAL_SCROLL_VH * 100}vh` }}
        aria-hidden="true"
      />
    </>
  )
}

/**
 * Feeds real load progress to the boot screen (components/laptop/BootScreen.tsx).
 * The boot screen itself is server-rendered so it can be on screen before any
 * JavaScript runs; this only moves its bar.
 */
function ProgressReporter() {
  const { progress } = useProgress()

  useEffect(() => {
    // This chunk arriving and the canvas existing is itself a stage — the largest
    // download of the whole boot.
    reportBootProgress(35 + progress * 0.55)
  }, [progress])

  return null
}

/**
 * Marks <html> with data-laptop-ready once the scene is genuinely presentable,
 * which is what fades the boot screen out.
 *
 * "The model has loaded" is not enough. Revealing on that alone showed the laptop
 * with its screen painted in fallback fonts, then visibly re-painted a moment later
 * — one of the things that made the first second look broken. So: wait for web
 * fonts, then let a few complete frames render (the screen texture repaints on
 * fonts.ready), and only then reveal.
 */
const READY_FRAMES = 3

function ReadySignal() {
  /** -1 while waiting for fonts; then counts rendered frames. */
  const frames = useRef(-1)

  useEffect(() => {
    let alive = true
    const fontsReady = document.fonts?.ready ?? Promise.resolve()
    fontsReady.then(() => {
      if (alive) frames.current = 0
    })
    return () => {
      alive = false
      delete document.documentElement.dataset.laptopReady
      resetBootProgress()
    }
  }, [])

  useFrame(() => {
    if (frames.current < 0 || frames.current >= READY_FRAMES) return
    frames.current += 1
    if (frames.current === READY_FRAMES) {
      reportBootProgress(100)
      document.documentElement.dataset.laptopReady = ""
    }
  })

  return null
}
