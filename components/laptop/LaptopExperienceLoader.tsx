"use client"

// components/laptop/LaptopExperienceLoader.tsx
//
// Mounts the presentation gate — but only once hydration is over.
//
// The gate is light (it imports no three.js; the scene itself is a separate lazy
// chunk, see LaptopExperience). What matters here is WHEN it first renders. During
// hydration React must render what the server rendered, so a gate hydrated with the
// page would first see the server's placeholder answer — "text" — and remove the
// boot flag the inline script set, flashing the text layout for a frame before
// correcting itself. Mounting it after hydration means its first render already
// reads the real mode.
//
// `isClient` is false on the server and during hydration, true from then on.

import { useSyncExternalStore } from "react"

import LaptopExperience from "./LaptopExperience"

const noopSubscribe = () => () => {}

export function LaptopExperienceLoader() {
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
  return isClient ? <LaptopExperience /> : null
}
