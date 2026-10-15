// app/not-found.tsx
//
// Slot 8 of the keyboard: a page that doesn't exist is a key that has popped off —
// 4, an empty socket with the switch showing, 4.

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "404 — key not found",
}

export default function NotFound() {
  return (
    <main className="keys k404">
      <div className="k404__row" aria-hidden="true">
        <span className="kc">4</span>
        <span className="k404__socket" />
        <span className="kc">4</span>
      </div>
      <h1>That key popped off.</h1>
      <p>There&rsquo;s nothing at this address.</p>
      {/* A full page load on purpose, not <Link>: the home page decides 2D or 3D
          in an inline <head> script (components/laptop/boot.ts) that only runs on
          a real load. A client-side hop would bring back the text-layout flash. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a className="kc kc--enter kc--word kc--lg" href="/">
        <span className="kc__mod" aria-hidden="true">
          ↵
        </span>
        <span>Back home</span>
      </a>
    </main>
  )
}
