"use client"

// components/laptop/CameraRig.tsx
//
// Camera pose as a pure function of scroll progress.
//
// Each frame: bracket the two keyframes around `progress`, ease between them, then
// lookAt the interpolated target. Adding a section = adding a row to CAMERA_KEYFRAMES.
//
// `damping` is a smoothing filter, not animation state: it always converges on the
// pose the progress value implies, so scrolling back up still lands exactly where
// it started. Set it to 0 for frame-exact output (calibration, screenshots, tests).
//
// The camera is read from useFrame's `state` rather than captured from useThree, and
// all scratch lives in refs — both so the React Compiler lint rules stay satisfied
// while we mutate, which is how R3F is meant to be driven.

import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from "three"

import { CAMERA, CAMERA_EASE, CAMERA_KEYFRAMES } from "./config"
import { makeCameraSample, sampleCamera } from "./lib/keyframes"

const WORLD_UP = new THREE.Vector3(0, 1, 0)

type Props = {
  progressRef: React.RefObject<number>
  /** 0 = snap exactly to the sampled pose. Defaults to CAMERA.damping. */
  damping?: number
  enabled?: boolean
}

export function CameraRig({ progressRef, damping = CAMERA.damping, enabled = true }: Props) {
  const sample = useRef(makeCameraSample())
  const smoothedPos = useRef(new THREE.Vector3())
  const smoothedTarget = useRef(new THREE.Vector3())
  const primed = useRef(false)
  const dir = useRef(new THREE.Vector3())

  useFrame((state, delta) => {
    if (!enabled) return

    const camera = state.camera as THREE.PerspectiveCamera
    const p = progressRef.current ?? 0
    const s = sample.current
    sampleCamera(CAMERA_KEYFRAMES, p, s, CAMERA.defaultFov, CAMERA_EASE)

    if (!primed.current || damping <= 0) {
      smoothedPos.current.copy(s.position)
      smoothedTarget.current.copy(s.lookAt)
      primed.current = true
    } else {
      // Framerate-independent exponential smoothing.
      const a = 1 - Math.exp(-delta / Math.max(damping, 1e-4))
      smoothedPos.current.lerp(s.position, a)
      smoothedTarget.current.lerp(s.lookAt, a)
    }

    camera.position.copy(smoothedPos.current)

    // Guard against a degenerate lookAt: if the view direction is (near) parallel to
    // the camera's up vector, lookAt() cannot build an orientation basis and the frame
    // renders black. Tilt `up` fractionally away rather than letting it collapse.
    dir.current.subVectors(smoothedTarget.current, smoothedPos.current)
    const len = dir.current.length()
    if (len > 1e-6) {
      dir.current.divideScalar(len)
      const alignment = Math.abs(dir.current.dot(WORLD_UP))
      if (alignment > 0.999) {
        camera.up.set(0, 1, -0.05).normalize()
      } else {
        camera.up.copy(WORLD_UP)
      }
    }
    camera.lookAt(smoothedTarget.current)

    // Widen the FOV on narrow viewports so the "screen fills the frame" poses,
    // which are framed for height, don't crop the screen horizontally.
    const targetFov = fovForAspect(s.fov, state.viewport.aspect)
    if (Math.abs(camera.fov - targetFov) > 1e-4) {
      camera.fov = targetFov
      camera.updateProjectionMatrix()
    }
  })

  return null
}

/**
 * Keyframe FOVs assume a landscape viewport (~16:9). Below that, widen the vertical
 * FOV so horizontal coverage is preserved — otherwise the screen-filling shots crop.
 */
const REFERENCE_ASPECT = 16 / 9

function fovForAspect(fov: number, aspect: number): number {
  if (aspect >= REFERENCE_ASPECT) return fov
  const half = THREE.MathUtils.degToRad(fov) / 2
  // Preserve the horizontal half-angle from the reference aspect.
  const halfH = Math.atan(Math.tan(half) * REFERENCE_ASPECT)
  const widened = 2 * Math.atan(Math.tan(halfH) / Math.max(aspect, 0.25))
  return THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(widened), fov, 78)
}
