// components/keys/KeysFooter.tsx
//
// Slot 7: the bottom row of the keyboard. The socials are the modifier keys (the
// same GH / LI / IG the 3D hero shows), the space bar carries the small print, and
// in the arrow cluster ↑ is the way back to the top.

import { profile, socials } from "@/data/profile"

export function KeysFooter() {
  return (
    <footer className="kfoot">
      <div className="kfoot__board">
        <nav className="kfoot__mods" aria-label="Elsewhere">
          {socials.map((s) => (
            <a
              key={s.code}
              className="kc"
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${s.code} — ${s.label} (opens in a new tab)`}
              data-legend={s.code}
            >
              {s.code}
            </a>
          ))}
        </nav>
        <p className="kc kfoot__space">
          © {profile.year} {profile.name} · {profile.location}
        </p>
        <div className="kfoot__arrows">
          <a className="kc" href="#hero" aria-label="↑ Back to top" data-legend="↑">
            ↑
          </a>
          <span className="kc" aria-hidden="true">
            ←
          </span>
          <span className="kc" aria-hidden="true">
            ↓
          </span>
          <span className="kc" aria-hidden="true">
            →
          </span>
        </div>
      </div>
    </footer>
  )
}
