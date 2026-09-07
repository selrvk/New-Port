"use client"

// components/laptop/hud/HeroHud.tsx
//
// The one place the spec deliberately keeps text as DOM rather than painting it on
// the screen: the Hero, where the laptop is still closed and there is no screen to
// paint on. It fades out as the lid opens and the camera pushes in.
//
// Opacity is written straight to the element each frame rather than held in state,
// so scrolling never re-renders React.

import { useRef } from "react"

import { profile, socials } from "@/data/profile"
import { SECTIONS } from "../config"
import { localProgress, smoothstep } from "../lib/keyframes"
import { useProgressEffect, useScramble } from "../lib/useProgressEffect"

type Props = {
  progressRef: React.RefObject<number>
  onExit: () => void
}

export function HeroHud({ progressRef, onExit }: Props) {
  const line1 = useScramble(profile.titleLines[0], 500)
  const line2 = useScramble(profile.titleLines[1], 700)
  const line3 = useScramble(profile.titleLines[2], 900)
  const line4 = useScramble(profile.titleLines[3], 1100)

  const rootRef = useRef<HTMLDivElement>(null)

  useProgressEffect(progressRef, (p) => {
    const el = rootRef.current
    if (!el) return
    const t = localProgress(p, SECTIONS.hero.start, SECTIONS.hero.end)
    // Hold through the lid opening, then hand off to the screen.
    const opacity = 1 - smoothstep(0.45, 0.82, t)
    el.style.opacity = String(opacity)
    el.style.transform = `translate3d(0, ${(-t * 40).toFixed(2)}px, 0)`
    el.style.pointerEvents = opacity < 0.05 ? "none" : "auto"
    el.style.visibility = opacity < 0.01 ? "hidden" : "visible"
  })

  const lines = [
    { text: line1, className: "hero-hud__line" },
    { text: line2, className: "hero-hud__line hero-hud__line--accent" },
    { text: line3, className: "hero-hud__line" },
    { text: line4, className: "hero-hud__line hero-hud__line--outline" },
  ]

  return (
    <div className="hero-hud" ref={rootRef}>
      <div className="hero-hud__top">
        <span className="hero-hud__meta">001</span>
        <span className="hero-hud__meta hero-hud__meta--name">{profile.name}</span>
        <span className="hero-hud__meta hero-hud__status">
          <span className="hero-hud__dot" />
          {profile.availableLabel}
        </span>
      </div>

      <div className="hero-hud__headline">
        {lines.map((l, i) => (
          <span key={i} className={l.className}>
            {l.text}
          </span>
        ))}
      </div>

      <div className="hero-hud__bottom">
        <p className="hero-hud__tagline">{profile.tagline}</p>
        <div className="hero-hud__actions">
          {socials.slice(0, 3).map((s) => (
            <a
              key={s.code}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-hud__social"
            >
              {s.code}
            </a>
          ))}
          <button type="button" className="hero-hud__exit" onClick={onExit}>
            View as text
          </button>
        </div>
      </div>
    </div>
  )
}
