"use client"

// components/laptop/BootScreen.tsx
//
// What a 3D visitor sees until the laptop is genuinely ready.
//
// Server-rendered and always in the markup, but invisible unless <html> carries
// data-laptop="boot" (set by the inline script before first paint) or "on" without
// data-laptop-ready (the scene is mounted but has not drawn yet). Visibility is pure
// CSS — see .boot-screen in globals.css — so it is correct from the first frame,
// before React has hydrated anything.
//
// The "text version" link appears after a few seconds for anyone on a slow
// connection. It is a plain link to ?view=text, which the boot script honours, so it
// works even if the JavaScript bundle never arrives.

import { useSyncExternalStore } from "react"

import { getBootProgress, subscribeBootProgress } from "./lib/bootProgress"

const serverProgress = () => 0

export function BootScreen() {
  const progress = useSyncExternalStore(subscribeBootProgress, getBootProgress, serverProgress)
  const pct = Math.round(progress)

  return (
    <div className="boot-screen" data-started={pct > 0 ? "" : undefined}>
      <div className="boot-screen__inner">
        <span className="boot-screen__label" role="status">
          booting<span className="sr-only"> the 3D portfolio</span>
        </span>
        <div className="boot-screen__track" aria-hidden="true">
          <div className="boot-screen__bar" style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
        <span className="boot-screen__pct" aria-hidden="true">
          {pct}%
        </span>
      </div>
      <a className="boot-screen__escape" href="?view=text">
        taking a while? read the text version →
      </a>
    </div>
  )
}
