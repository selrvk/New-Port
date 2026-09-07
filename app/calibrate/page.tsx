// app/calibrate/page.tsx
//
// Dev-only calibration rig for components/laptop/config.ts.
// 404s in production so it never ships.
//
// Note: this imports the client component directly rather than via
// next/dynamic({ ssr: false }) — that option is not allowed in a Server Component.
// R3F only creates the WebGL context in an effect, so SSR just emits an empty div.

import { notFound } from "next/navigation"
import { Suspense } from "react"

import CalibrateClient from "./CalibrateClient"

export const metadata = { title: "calibrate", robots: { index: false, follow: false } }

export default function CalibratePage() {
  if (process.env.NODE_ENV === "production") notFound()
  return (
    <Suspense fallback={<div style={{ background: "#0A0A0A", position: "fixed", inset: 0 }} />}>
      <CalibrateClient />
    </Suspense>
  )
}
