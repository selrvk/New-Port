"use client"

// components/laptop/Laptop.tsx
//
// Loads the GLB once, drives the lid, and hosts `lidGroup` — a clean scene-unit
// space pinned to the hinge that everything else (screen surface, stickers) lives in.
//
// Why lidGroup exists: the GLB's "Screen" node carries a non-uniform scale
// (100, 100, 88.235) and a 180° yaw. Parenting our own meshes to it would distort
// their proportions and flip their axes. So we drive that node's rotation, and
// mirror the same rotation onto a plain group we fully control.

import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { forwardRef, useImperativeHandle, useLayoutEffect, useMemo, useRef, type ReactNode } from "react"
import * as THREE from "three"

import { HINGE, LID, LID_EASE, LID_KEYFRAMES, LID_LIFT_KEYFRAMES, MODEL } from "./config"
import { sampleScalar } from "./lib/keyframes"

export type LaptopHandle = {
  /** The GLB's lid node. Rotation is driven; do not set it elsewhere. */
  lidNode: THREE.Object3D | null
  /** Clean scene-unit group pinned at the hinge, rotating with the lid. */
  lidGroup: THREE.Group | null
  /** The GLB's base/keyboard node. */
  frameNode: THREE.Object3D | null
  /** Current world rotation of the lid, in radians. */
  rotation: number
}

type Props = {
  /** Single source of truth for the whole experience. */
  progressRef: React.RefObject<number>
  /** Rendered inside `lidGroup` — screen surface, stickers. */
  lidChildren?: ReactNode
  /** Rendered in scene space alongside the model — keycaps. */
  children?: ReactNode
  /** Called once after load with the measured bounds, for calibration. */
  onMeasure?: (info: MeasureInfo) => void
}

export type MeasureInfo = {
  nodeNames: string[]
  deck: { min: THREE.Vector3; max: THREE.Vector3 }
  lid: { min: THREE.Vector3; max: THREE.Vector3 }
  whole: { min: THREE.Vector3; max: THREE.Vector3 }
}

// Scratch objects — reused every frame so useFrame allocates nothing.
const _q = new THREE.Quaternion()
const _axisX = new THREE.Vector3(1, 0, 0)

export const Laptop = forwardRef<LaptopHandle, Props>(function Laptop(
  { progressRef, lidChildren, children, onMeasure },
  ref
) {
  const { scene, nodes } = useGLTF(MODEL.path)

  const lidNodeRef = useRef<THREE.Object3D | null>(null)
  const frameNodeRef = useRef<THREE.Object3D | null>(null)
  const lidGroupRef = useRef<THREE.Group>(null)
  const rotationRef = useRef(LID.worldClosed)

  /**
   * The lid node's authored quaternion (Ry 180°). We post-multiply our hinge
   * rotation onto it rather than overwriting `.rotation`, which would discard the yaw.
   */
  const baseQuat = useMemo(() => new THREE.Quaternion(), [])
  /** The lid node's authored local position, so the closing lift is relative to it. */
  const basePos = useMemo(() => new THREE.Vector3(), [])

  useLayoutEffect(() => {
    const lid = nodes[MODEL.nodes.lid] ?? scene.getObjectByName(MODEL.nodes.lid) ?? null
    const frame = nodes[MODEL.nodes.frame] ?? scene.getObjectByName(MODEL.nodes.frame) ?? null

    lidNodeRef.current = lid
    frameNodeRef.current = frame

    if (!lid) {
      console.error(
        `[Laptop] Lid node "${MODEL.nodes.lid}" not found. Available:`,
        Object.keys(nodes)
      )
      return
    }
    baseQuat.copy(lid.quaternion)
    basePos.copy(lid.position)

    // Shadows on the model's own meshes.
    //
    // NOTE: do NOT tint the "ComputerScreen" material to hide the white display.
    // That material is shared between the display quad AND the lid's outer shell,
    // so darkening it turns the whole lid near-black while it opens and closes.
    // The white is already fully covered because SCREEN.size matches the measured
    // display quad exactly — see LID.displayQuad.
    scene.traverse((o) => {
      if (!(o as THREE.Mesh).isMesh) return
      const m = o as THREE.Mesh
      m.castShadow = true
      m.receiveShadow = true
      m.frustumCulled = false
    })

    if (onMeasure && frame) {
      // Measure at the open pose so the numbers describe the working configuration.
      lid.quaternion.copy(baseQuat).multiply(
        _q.setFromAxisAngle(_axisX, LID.worldOpen * LID.nodeSign)
      )
      scene.updateMatrixWorld(true)

      const deckBox = new THREE.Box3().setFromObject(frame)
      const lidBox = new THREE.Box3().setFromObject(lid)
      const wholeBox = new THREE.Box3().setFromObject(scene)

      onMeasure({
        nodeNames: Object.keys(nodes),
        deck: { min: deckBox.min.clone(), max: deckBox.max.clone() },
        lid: { min: lidBox.min.clone(), max: lidBox.max.clone() },
        whole: { min: wholeBox.min.clone(), max: wholeBox.max.clone() },
      })
    }
  }, [scene, nodes, baseQuat, basePos, onMeasure])

  useFrame(() => {
    const p = progressRef.current ?? 0
    const theta = sampleScalar(LID_KEYFRAMES, p, "rotation", LID_EASE)
    const lift = sampleScalar(LID_LIFT_KEYFRAMES, p, "lift", LID_EASE)
    rotationRef.current = theta

    const lid = lidNodeRef.current
    if (lid) {
      // Post-multiply keeps the node's authored 180° yaw intact.
      lid.quaternion.copy(baseQuat).multiply(
        _q.setFromAxisAngle(_axisX, theta * LID.nodeSign)
      )
      // The lid node lives inside the model group, so convert the scene-unit lift
      // into that group's local units.
      lid.position.y = basePos.y + lift / MODEL.scale
    }
    if (lidGroupRef.current) {
      lidGroupRef.current.rotation.x = theta
      lidGroupRef.current.position.y = HINGE.y + lift
    }
  })

  useImperativeHandle(
    ref,
    () => ({
      get lidNode() {
        return lidNodeRef.current
      },
      get lidGroup() {
        return lidGroupRef.current
      },
      get frameNode() {
        return frameNodeRef.current
      },
      get rotation() {
        return rotationRef.current
      },
    }),
    []
  )

  return (
    <group name="laptop-root">
      <primitive object={scene} scale={MODEL.scale} />

      {/* Clean scene-unit space pinned at the hinge. Rotates with the lid.
          At rotation 0 the lid is bolt upright: +Y up the panel, +Z toward the viewer. */}
      <group ref={lidGroupRef} name="lid-group" position={[HINGE.x, HINGE.y, HINGE.z]}>
        {lidChildren}
      </group>

      {children}
    </group>
  )
})

useGLTF.preload(MODEL.path)
