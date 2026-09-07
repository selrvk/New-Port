"use client"

// components/laptop/ScrollStage.tsx
//
// Owns the fixed, full-viewport canvas (mounted once, never unmounted), the tall
// spacer that gives the page its scroll range, and the DOM that sits over the scene.

import { useProgress } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Suspense, useCallback, useRef, useState } from "react"
import * as THREE from "three"

import { HeroHud } from "./hud/HeroHud"
import { ContactInput } from "./hud/ContactInput"
import { ScrollHint } from "./hud/ScrollHint"
import { Scene } from "./Scene"
import { PerfGovernor, createPerfStats } from "./PerfGovernor"
import { CAMERA, COLORS, PERF, TOTAL_SCROLL_VH } from "./config"
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

      <Loader />

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
 * Real loading state rather than a blank screen. Reads drei's shared loader store,
 * so it reports actual GLB + texture progress.
 */
function Loader() {
  const { progress, active } = useProgress()

  // No local dismissal state: the panel simply fades out via CSS once loading
  // finishes and stops receiving pointer events. Tracking "dismissed" in state
  // would mean calling setState from an effect for no visible benefit.
  return (
    <div className={`laptop-loader${active ? "" : " is-done"}`} role="status" aria-live="polite">
      <div className="laptop-loader__inner">
        <span className="laptop-loader__label">booting</span>
        <div className="laptop-loader__track">
          <div
            className="laptop-loader__bar"
            style={{ width: `${Math.round(progress)}%`, background: COLORS.neon }}
          />
        </div>
        <span className="laptop-loader__pct">{Math.round(progress)}%</span>
      </div>
    </div>
  )
}
