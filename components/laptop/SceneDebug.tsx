"use client"

// components/laptop/SceneDebug.tsx
//
// Dev-only readout, enabled with ?debug=1.
//
// Writes straight into a DOM node rather than React state (this updates every
// frame) — and via the DOM specifically because the automation context used to
// inspect this page shares the document but not `window`, so debug globals are
// invisible to it.

import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from "three"

import { MODEL, SPILL_LAYER } from "./config"
import { contactState } from "./contact/state"

type Props = {
  progressRef: React.RefObject<number>
  targetId: string
}

const _box = new THREE.Box3()
const _size = new THREE.Vector3()
const _center = new THREE.Vector3()
const _dir = new THREE.Vector3()

export function SceneDebug({ progressRef, targetId }: Props) {
  const last = useRef(0)

  useFrame((state) => {
    const now = performance.now()
    if (now - last.current < 250) return
    last.current = now

    const el = document.getElementById(targetId)
    if (!el) return

    const cam = state.camera as THREE.PerspectiveCamera
    const model = state.scene.getObjectByName("laptop-root")
    const lid = state.scene.getObjectByName(MODEL.nodes.lid)
    const surface = state.scene.getObjectByName("screen-surface")

    let boxInfo = "model: MISSING"
    if (model) {
      _box.setFromObject(model)
      if (_box.isEmpty()) {
        boxInfo = "model: EMPTY BOX (no renderable children)"
      } else {
        _box.getSize(_size)
        _box.getCenter(_center)
        boxInfo =
          `model centre [${f(_center.x)}, ${f(_center.y)}, ${f(_center.z)}] ` +
          `size [${f(_size.x)}, ${f(_size.y)}, ${f(_size.z)}]`
      }
    }

    cam.getWorldDirection(_dir)
    const p = progressRef.current ?? 0

    el.textContent =
      `p ${p.toFixed(4)}\n` +
      `cam pos [${f(cam.position.x)}, ${f(cam.position.y)}, ${f(cam.position.z)}] fov ${f(cam.fov)}\n` +
      `cam dir [${f(_dir.x)}, ${f(_dir.y)}, ${f(_dir.z)}] up [${f(cam.up.x)}, ${f(cam.up.y)}, ${f(cam.up.z)}]\n` +
      `${boxInfo}\n` +
      `lid ${lid ? "ok rotX " + f(lid.rotation.x) + " visible " + lid.visible : "MISSING"}\n` +
      `surface ${surface ? "ok visible " + surface.visible : "MISSING"}` +
      `${surface ? " spill-lit " + surface.layers.isEnabled(SPILL_LAYER) : ""}\n` +
      `scene children ${state.scene.children.length} · aspect ${f(state.viewport.aspect)}\n` +
      `contact overlay ${contactState.rect.visible ? "VISIBLE" : "hidden"} ` +
      `[${Math.round(contactState.rect.x)},${Math.round(contactState.rect.y)} ` +
      `${Math.round(contactState.rect.w)}x${Math.round(contactState.rect.h)}] ` +
      `field ${contactState.active} focused ${contactState.focused} ` +
      `name="${contactState.values.name}"`
  })

  return null
}

const f = (v: number) => (Math.round(v * 1000) / 1000).toFixed(3)
