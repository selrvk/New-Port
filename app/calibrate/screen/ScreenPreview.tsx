"use client"

// app/calibrate/screen/ScreenPreview.tsx
//
// Renders the laptop's screen painters straight onto a DOM canvas, with no WebGL.
//
// Two reasons this exists: the screen content is the part most worth iterating on,
// and it can be checked pixel-for-pixel without a GPU context, a model load, or a
// scroll position. Add `?p=` for a single progress value, or `?strip=` for a
// contact sheet across a range.

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"

import { SCREEN, SECTIONS, SECTION_ORDER, type SectionId } from "@/components/laptop/config"
import { onImageLoaded, preloadImages } from "@/components/laptop/lib/imageCache"
import { invalidateFonts } from "@/components/laptop/lib/canvas2d"
import { makeStickerTexture } from "@/components/laptop/lib/stickerTexture"
import { ContactInput } from "@/components/laptop/hud/ContactInput"
import { contactState } from "@/components/laptop/contact/state"
import { paintScreen, sectionAt } from "@/components/laptop/screens"
import { sortedCertifications } from "@/data/certifications"
import { projects } from "@/data/projects"

function Frame({ p, width }: { p: number; width: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => onImageLoaded(() => setTick((n) => n + 1)), [])
  useEffect(() => {
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (cancelled) return
      invalidateFonts()
      setTick((n) => n + 1)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext("2d", { alpha: false })
    if (!ctx) return
    paintScreen(ctx, SCREEN.canvas.width, SCREEN.canvas.height, p)
  }, [p, tick])

  const section = sectionAt(p)
  const range = SECTIONS[section]
  const local = (p - range.start) / (range.end - range.start)

  return (
    <figure style={{ margin: 0 }}>
      <canvas
        ref={ref}
        width={SCREEN.canvas.width}
        height={SCREEN.canvas.height}
        style={{
          width,
          height: (width * SCREEN.canvas.height) / SCREEN.canvas.width,
          display: "block",
          border: "1px solid #1E1E1E",
          background: "#05070A",
        }}
      />
      <figcaption
        style={{
          font: "11px/1.6 ui-monospace, Menlo, monospace",
          color: "#6B6860",
          padding: "6px 2px",
        }}
      >
        p <span style={{ color: "#E8FF47" }}>{p.toFixed(4)}</span> · {section} · local{" "}
        {local.toFixed(3)}
      </figcaption>
    </figure>
  )
}

/**
 * The lid stickers, drawn at their real texture resolution. Checking the artwork
 * needs no GPU — only the placement does.
 */
function StickerSheet() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const host = ref.current
    if (!host) return
    host.replaceChildren()
    sortedCertifications.forEach((cert, i) => {
      const tex = makeStickerTexture(cert, i)
      const src = tex.image as HTMLCanvasElement
      src.style.width = "260px"
      src.style.height = "auto"
      src.style.display = "block"
      const cell = document.createElement("figure")
      cell.style.margin = "0"
      const cap = document.createElement("figcaption")
      cap.textContent = `${i}. ${cert.short}`
      cap.style.cssText =
        "font:11px/1.6 ui-monospace,Menlo,monospace;color:#6B6860;padding:6px 2px"
      cell.append(src, cap)
      host.append(cell)
      tex.dispose()
    })
  }, [])
  return (
    <div
      ref={ref}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 14,
        // Checkerboard so the die-cut edge and transparency are both visible.
        backgroundImage:
          "linear-gradient(45deg,#151515 25%,transparent 25%),linear-gradient(-45deg,#151515 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#151515 75%),linear-gradient(-45deg,transparent 75%,#151515 75%)",
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0,0 10px,10px -10px,-10px 0",
        padding: 14,
      }}
    />
  )
}

/** Drives the real ContactInput against a live-painted contact screen. */
function FormHarness() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [log, setLog] = useState("")

  useEffect(() => {
    const box = { x: 40, y: 40, w: 900, h: 562 }
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      Object.assign(contactState.rect, box, { visible: true })
      const c = ref.current
      const ctx = c?.getContext("2d", { alpha: false })
      if (ctx) paintScreen(ctx, SCREEN.canvas.width, SCREEN.canvas.height, contactMidpoint())
      setLog(
        `focused ${contactState.focused} · field ${contactState.active} · ` +
          `name="${contactState.values.name}" email="${contactState.values.email}" ` +
          `msg=${contactState.values.message.length} chars · err=${contactState.error ?? "none"}`
      )
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      contactState.rect.visible = false
    }
  }, [])

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", padding: 16 }}>
      <canvas
        ref={ref}
        width={SCREEN.canvas.width}
        height={SCREEN.canvas.height}
        style={{ position: "absolute", left: 40, top: 40, width: 900, height: 562 }}
      />
      <ContactInput />
      <pre
        style={{
          position: "absolute",
          left: 40,
          top: 620,
          color: "#E8FF47",
          font: "12px/1.7 ui-monospace, Menlo, monospace",
          whiteSpace: "pre-wrap",
          maxWidth: 900,
        }}
      >
        {log}
      </pre>
    </div>
  )
}

/** A progress value in the middle of the contact section. */
function contactMidpoint() {
  const { start, end } = SECTIONS.contact
  return start + (end - start) * 0.45
}

export default function ScreenPreview() {
  const params = useSearchParams()

  useEffect(() => {
    preloadImages(projects.map((pr) => pr.image))
  }, [])

  const stickers = params.get("stickers") === "1"
  /**
   * ?form=1 pins the contact overlay to a fixed rect so the real <input> can be
   * clicked and typed into without a WebGL scene to project it. The 3D path uses
   * ContactAnchor; this only replaces the projection, not the input itself.
   */
  const form = params.get("form") === "1"
  const single = params.get("p")
  const strip = params.get("strip") as SectionId | null
  const count = Math.min(24, Math.max(2, parseInt(params.get("n") ?? "6", 10)))

  let frames: number[]
  let width = 900

  if (strip && SECTION_ORDER.includes(strip)) {
    const { start, end } = SECTIONS[strip]
    // Inset from the edges so we sample inside the section, not on its boundaries.
    frames = Array.from({ length: count }, (_, i) => start + ((end - start) * (i + 0.5)) / count)
    width = 560
  } else if (single != null) {
    frames = [Math.max(0, Math.min(1, parseFloat(single) || 0))]
  } else {
    frames = SECTION_ORDER.map((id) => (SECTIONS[id].start + SECTIONS[id].end) / 2)
    width = 560
  }

  if (form) return <FormHarness />

  if (stickers) {
    return (
      <div style={{ background: "#0A0A0A", minHeight: "100vh", padding: 16 }}>
        <StickerSheet />
      </div>
    )
  }

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", padding: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: frames.length === 1 ? "1fr" : "repeat(auto-fill, minmax(560px, 1fr))",
          gap: 16,
        }}
      >
        {frames.map((p, i) => (
          <Frame key={i} p={p} width={width} />
        ))}
      </div>
    </div>
  )
}
