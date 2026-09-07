"use client"

// components/laptop/LaptopExperienceLoader.tsx
//
// Keeps three.js out of the server bundle and off the critical path.
//
// This wrapper exists because `next/dynamic({ ssr: false })` is not allowed inside a
// Server Component, and three.js touches `window` on import — so the whole 3D layer
// is loaded lazily, client-side only.

import dynamic from "next/dynamic"

const LaptopExperience = dynamic(() => import("./LaptopExperience"), {
  ssr: false,
  loading: () => null,
})

export function LaptopExperienceLoader() {
  return <LaptopExperience />
}
