"use client"

// components/laptop/Stickers.tsx
//
// Certifications, landing on the back of the lid as you scroll.
//
// Each is a textured plane inside `lidGroup`, so it inherits the lid's rotation and
// stays flush against it — including when the lid closes at the very end.
//
// The lid back faces -Z in lidGroup space, so each plane is rotated 180° about Y to
// face outward. Getting that wrong renders them mirrored and facing into the lid,
// which is invisible rather than obviously broken.
//
// Landing is a pure function of scroll: travel in along the lid normal, shed a few
// degrees of rotation, then a damped squash-settle on impact. Scrub back and they
// lift off again.

import { useFrame } from "@react-three/fiber"
import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"

import { sortedCertifications } from "@/data/certifications"

import { SECTIONS, STICKERS } from "./config"
import { stickerPose } from "./certs/landing"
import { localProgress } from "./lib/keyframes"
import { makeStickerTexture } from "./lib/stickerTexture"

type Props = {
  progressRef: React.RefObject<number>
}

export function Stickers({ progressRef }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  const textures = useMemo(
    () => sortedCertifications.map((cert, i) => makeStickerTexture(cert, i)),
    []
  )
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures])

  // Hidden until the first frame decides otherwise. Previously this was a
  // `visible={false}` JSX prop, which React re-applies on every render and would
  // fight the per-frame update; setting it once here does not.
  useLayoutEffect(() => {
    for (const mesh of meshRefs.current) if (mesh) mesh.visible = false
  }, [])

  useFrame(() => {
    const p = progressRef.current ?? 0
    const { start, end } = SECTIONS.certifications
    const t = localProgress(p, start, end)
    // Before the section they are not there yet; after it they stay stuck on.
    const arrived = p >= start
    const count = sortedCertifications.length

    for (let i = 0; i < count; i++) {
      const mesh = meshRefs.current[i]
      if (!mesh) continue

      const pose = stickerPose(arrived ? t : 0, i, count)
      mesh.visible = arrived && pose.visible
      if (!mesh.visible) continue

      mesh.position.set(pose.x, pose.y, pose.z)
      mesh.scale.set(pose.scaleX, pose.scaleY, 1)
      mesh.rotation.z = pose.rotation
      setOpacity(mesh, pose.opacity)
    }
  })

  return (
    <group ref={groupRef} name="stickers">
      {sortedCertifications.map((cert, i) => (
        <mesh
          key={cert.id}
          ref={(el) => {
            meshRefs.current[i] = el
          }}
          // 180° about Y so the face points out of the lid's back, not into it.
          rotation={[0, Math.PI, 0]}
          // Later certs paint over earlier ones. With near-coplanar transparent
          // planes, distance sorting is unstable and flickers; this is not.
          renderOrder={10 + i}
        >
          <planeGeometry args={[STICKERS.size.w, STICKERS.size.h]} />
          <meshStandardMaterial
            map={textures[i]}
            // Self-illuminated as well as lit.
            //
            // A purely lit material is only visible while something is shining on
            // it, and the only thing lighting the lid's back is a light that fades
            // with the section. That made the stickers dim out one by one as it
            // dropped — furthest from the point light first — and vanish entirely
            // once the camera moved on, including on the closed lid at the end.
            // A modest emissive floor means they are always legible; the light
            // still does the work of making them look lit during the orbit.
            emissive="#ffffff"
            emissiveMap={textures[i]}
            emissiveIntensity={STICKERS.emissiveFloor}
            transparent
            roughness={0.62}
            metalness={0}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-2}
          />
        </mesh>
      ))}
    </group>
  )
}

function setOpacity(mesh: THREE.Mesh, value: number) {
  const mat = mesh.material as THREE.MeshStandardMaterial
  if (mat.opacity !== value) mat.opacity = value
}
