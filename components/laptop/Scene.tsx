"use client"

// components/laptop/Scene.tsx
//
// Everything inside the Canvas. Mounted once and never unmounted — the laptop
// persists across every section; only the numbers driving it change.

import { useFrame } from "@react-three/fiber"
import { useLayoutEffect, useRef } from "react"
import * as THREE from "three"

import { CameraRig } from "./CameraRig"
import type { PerfStats } from "./PerfGovernor"
import { ContactAnchor } from "./ContactAnchor"
import { Floor } from "./Floor"
import { Laptop } from "./Laptop"
import { SceneDebug } from "./SceneDebug"
import { ScreenSurface } from "./ScreenSurface"
import { Stickers } from "./Stickers"
import { Keyboard } from "./Keyboard"
import { COLORS, LIGHTS, SCREEN, SECTIONS, SPILL_LAYER } from "./config"
import { localProgress, sampleTable, smoothstep } from "./lib/keyframes"

type Props = {
  progressRef: React.RefObject<number>
}

type SceneProps = Props & { debug?: boolean; statsRef?: React.RefObject<PerfStats> }

/**
 * A point light in front of the screen, driven by the same boot curve as the
 * emissive map, so the panel appears to actually cast light onto the keyboard as
 * it wakes rather than just being a bright rectangle.
 */
function ScreenSpill({ progressRef }: Props) {
  const ref = useRef<THREE.PointLight>(null)

  // Restricted to SPILL_LAYER so it lights the deck but not the display. Without
  // this the panel lit itself: a soft white blob right through the middle of the UI.
  useLayoutEffect(() => {
    ref.current?.layers.set(SPILL_LAYER)
  }, [])

  useFrame(() => {
    const light = ref.current
    if (!light) return
    const p = progressRef.current ?? 0
    const hero = SECTIONS.hero
    const wake =
      p < hero.end ? sampleTable(SCREEN.bootFlicker, localProgress(p, hero.start, hero.end)) : 1
    light.intensity = wake * LIGHTS.screenSpill.intensity
  })
  return (
    <pointLight
      ref={ref}
      position={[0, 0.85, -0.55]}
      distance={LIGHTS.screenSpill.distance}
      color={LIGHTS.screenSpill.color}
      intensity={0}
    />
  )
}

/**
 * Lights the back of the lid, but only while the camera is behind it. Left on
 * permanently it would wash out the front of the machine from an unmotivated
 * direction in every other section.
 */
function LidBackLight({ progressRef }: Props) {
  const ref = useRef<THREE.PointLight>(null)
  useFrame(() => {
    const light = ref.current
    if (!light) return
    const p = progressRef.current ?? 0
    const { start, end } = SECTIONS.certifications
    // Ramp in over the orbit and back out as the camera swings away.
    const t = localProgress(p, start, end)
    const on =
      p < start || p >= end
        ? 0
        : smoothstep(0, LIGHTS.lidBack.fadeIn, t) *
          (1 - smoothstep(LIGHTS.lidBack.fadeOut, 1, t))
    light.intensity = on * LIGHTS.lidBack.intensity
  })
  return (
    <pointLight
      ref={ref}
      position={LIGHTS.lidBack.position}
      distance={LIGHTS.lidBack.distance}
      color={LIGHTS.lidBack.color}
      intensity={0}
    />
  )
}

export function Scene({ progressRef, debug = false, statsRef }: SceneProps) {
  return (
    <>
      <color attach="background" args={[COLORS.bg]} />

      <ambientLight intensity={LIGHTS.ambient.intensity} color={LIGHTS.ambient.color} />
      <directionalLight
        position={LIGHTS.key.position}
        intensity={LIGHTS.key.intensity}
        color={LIGHTS.key.color}
      />
      <directionalLight
        position={LIGHTS.fill.position}
        intensity={LIGHTS.fill.intensity}
        color={LIGHTS.fill.color}
      />
      <directionalLight
        position={LIGHTS.rim.position}
        intensity={LIGHTS.rim.intensity}
        color={LIGHTS.rim.color}
      />
      <ScreenSpill progressRef={progressRef} />
      <LidBackLight progressRef={progressRef} />

      <Floor />

      <Laptop
        progressRef={progressRef}
        lidChildren={
          <>
            <ScreenSurface progressRef={progressRef} />
            <Stickers progressRef={progressRef} />
          </>
        }
      >
        <Keyboard progressRef={progressRef} />
      </Laptop>

      <ContactAnchor progressRef={progressRef} />
      <CameraRig progressRef={progressRef} />

      {debug ? (
        <SceneDebug progressRef={progressRef} targetId="scene-debug" statsRef={statsRef} />
      ) : null}
    </>
  )
}
