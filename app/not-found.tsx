// app/not-found.tsx
//
// Slot 8 of the box: a page that doesn't exist is the box opened from the wrong
// end. The big print is upside down; the one line you need to read is not.

import type { Metadata } from "next"

import { UprightMark } from "@/components/box/marks"

export const metadata: Metadata = {
  title: "404 — this side up",
}

export default function NotFound() {
  return (
    <main className="box box-404">
      <div className="box-404__flipped" aria-hidden="true">
        <p className="box-display box-404__code">404</p>
        <p className="box-label box-404__mark">
          <UprightMark />
          This side up
        </p>
      </div>
      <h1 className="box-404__note">
        You&rsquo;ve opened the box from the wrong end — there&rsquo;s nothing at this address.
      </h1>
      {/* A full page load on purpose, not <Link>: the home page decides 2D or 3D
          in an inline <head> script (components/laptop/boot.ts) that only runs on
          a real load. A client-side hop would bring back the text-layout flash. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a className="box-tab box-tab--spot" href="/">
        Back to the front <span aria-hidden="true">→</span>
      </a>
    </main>
  )
}
