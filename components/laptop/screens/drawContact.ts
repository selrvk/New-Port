// components/laptop/screens/drawContact.ts
//
// The Contact screen: a terminal form.
//
// Prompts rather than labelled inputs — `name:`, `email:`, `message:` with a
// blinking caret — matching the spec's ask that this read as a shell session. The
// values are typed into a real DOM input laid invisibly over this surface (see
// hud/ContactInput), so what is drawn here is a representation, never the source
// of truth.

import { contact, contactPrompts } from "@/data/contact"
import { profile, socials } from "@/data/profile"

import { COLORS } from "../config"
import { clamp01, smoothstep } from "../lib/keyframes"
import {
  clearScreen,
  drawScanlines,
  drawVignette,
  mono,
  type ScreenCtx,
  wrapText,
} from "../lib/canvas2d"
import { contactState } from "../contact/state"

const wrapBuf: string[] = []

/** Prompts finish appearing well before the lid starts closing. */
const REVEAL_SPAN = 0.34

export const drawContact: (s: ScreenCtx) => void = (s) => {
  const { ctx, w, h, t } = s
  clearScreen(s, "#06080A")

  const pad = Math.round(w * 0.062)
  ctx.textBaseline = "middle"

  // ── Title bar ──
  const barH = h * 0.072
  ctx.fillStyle = "rgba(255,255,255,0.03)"
  ctx.fillRect(0, 0, w, barH)
  ctx.fillStyle = "rgba(240,237,230,0.08)"
  ctx.fillRect(0, barH, w, 1)
  ctx.font = mono(Math.round(h * 0.026), 500)
  ctx.fillStyle = "rgba(240,237,230,0.45)"
  const title = `${profile.name.toLowerCase().split(" ")[0]}@portfolio — contact`
  ctx.fillText(title, w / 2 - ctx.measureText(title).width / 2, barH / 2)

  let y = barH + h * 0.075

  ctx.font = mono(Math.round(h * 0.030), 500)
  ctx.fillStyle = COLORS.screenDim
  ctx.fillText("$ ./contact.sh", pad, y)
  y += h * 0.062

  if (contactState.submitted) {
    drawSent(s, pad, y)
    drawScanlines(s, 0.045)
    drawVignette(s, 0.4)
    return
  }

  const lineH = h * 0.052
  const promptSize = Math.round(h * 0.032)

  for (let i = 0; i < contactPrompts.length; i++) {
    // Prompts land one at a time as the section opens.
    const reveal = smoothstep(0, 0.5, clamp01((t - (i / contactPrompts.length) * REVEAL_SPAN) / 0.16))
    if (reveal <= 0.01) break

    const prompt = contactPrompts[i]
    const value = contactState.values[prompt.key]
    const isActive = i === contactState.active

    ctx.save()
    ctx.globalAlpha = reveal

    ctx.font = mono(promptSize, 600)
    ctx.fillStyle = isActive ? COLORS.neon : "rgba(232,255,71,0.45)"
    ctx.fillText(prompt.prompt, pad, y)
    const promptW = ctx.measureText(`${prompt.prompt} `).width

    ctx.font = mono(promptSize, 400)
    const textX = pad + promptW
    const maxW = w - textX - pad

    if (prompt.type === "textarea") {
      const source = value || (isActive ? "" : "")
      const shown = source || (isActive ? "" : prompt.placeholder)
      ctx.fillStyle = value ? COLORS.paper : "rgba(240,237,230,0.22)"
      const n = value ? wrapText(ctx, value, maxW, wrapBuf) : 0
      if (n) {
        for (let l = 0; l < Math.min(n, 4); l++) {
          ctx.fillText(wrapBuf[l], textX, y + l * lineH * 0.82)
        }
        y += (Math.min(n, 4) - 1) * lineH * 0.82
      } else {
        ctx.fillText(shown, textX, y)
      }
      if (isActive) drawCaret(s, textX + (n ? ctx.measureText(wrapBuf[Math.min(n, 4) - 1]).width : 0), y, promptSize)
    } else {
      ctx.fillStyle = value ? COLORS.paper : "rgba(240,237,230,0.22)"
      ctx.fillText(value || prompt.placeholder, textX, y)
      if (isActive) drawCaret(s, textX + ctx.measureText(value).width + 4, y, promptSize)
    }

    ctx.restore()
    y += lineH * 1.25
  }

  // ── Error / hint line ──
  y += h * 0.02
  ctx.font = mono(Math.round(h * 0.024), 500)
  if (contactState.error) {
    ctx.fillStyle = COLORS.hot
    ctx.fillText(`! ${contactState.error}`, pad, y)
  } else if (contactState.focused) {
    ctx.fillStyle = "rgba(240,237,230,0.32)"
    ctx.fillText("↵ next field   ·   ⌘↵ send", pad, y)
  } else {
    ctx.fillStyle = "rgba(232,255,71,0.55)"
    ctx.fillText("click to type", pad, y)
  }

  drawFooter(s, pad)
  drawScanlines(s, 0.045)
  drawVignette(s, 0.4)
}

/**
 * Blinks off wall-clock time, not scroll — a caret that only moved when you
 * scrolled would read as a rendering glitch rather than a cursor.
 */
function drawCaret(s: ScreenCtx, x: number, y: number, size: number) {
  if (Math.floor(Date.now() / 500) % 2 !== 0) return
  s.ctx.fillStyle = COLORS.neon
  s.ctx.fillRect(x, y - size * 0.58, Math.max(2, size * 0.09), size * 1.16)
}

function drawSent(s: ScreenCtx, pad: number, y: number) {
  const { ctx, w, h } = s
  ctx.font = mono(Math.round(h * 0.030), 500)
  ctx.fillStyle = COLORS.neon
  ctx.fillText("[ ok ] message composed", pad, y)
  y += h * 0.055

  ctx.font = mono(Math.round(h * 0.026), 400)
  ctx.fillStyle = "rgba(240,237,230,0.55)"
  ctx.fillText("your mail client should be open.", pad, y)
  y += h * 0.042
  ctx.fillText("if not, reach me directly:", pad, y)
  y += h * 0.06

  ctx.font = mono(Math.round(h * 0.028), 600)
  ctx.fillStyle = COLORS.paper
  ctx.fillText(contact.email, pad, y)
  y += h * 0.045
  ctx.fillStyle = "rgba(240,237,230,0.55)"
  ctx.font = mono(Math.round(h * 0.026), 400)
  ctx.fillText(contact.phone, pad, y)
  void w
}

function drawFooter(s: ScreenCtx, pad: number) {
  const { ctx, w, h } = s
  const y = h - h * 0.058
  ctx.fillStyle = "rgba(240,237,230,0.07)"
  ctx.fillRect(pad, y - h * 0.03, w - pad * 2, 1)

  ctx.font = mono(Math.round(h * 0.022), 400)
  ctx.fillStyle = "rgba(240,237,230,0.34)"
  ctx.fillText(contact.email, pad, y)

  const handles = socials.map((so) => so.code).join("  ·  ")
  ctx.fillStyle = "rgba(240,237,230,0.24)"
  ctx.fillText(handles, w - pad - ctx.measureText(handles).width, y)
}
