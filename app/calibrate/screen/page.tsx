// app/calibrate/screen/page.tsx
//
// Dev-only. Renders the screen painters without WebGL — see ScreenPreview.

import { notFound } from "next/navigation"
import { Suspense } from "react"

import ScreenPreview from "./ScreenPreview"

export const metadata = { title: "screen preview", robots: { index: false, follow: false } }

export default function ScreenPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound()
  return (
    <Suspense fallback={<div style={{ background: "#0A0A0A", position: "fixed", inset: 0 }} />}>
      <ScreenPreview />
    </Suspense>
  )
}
