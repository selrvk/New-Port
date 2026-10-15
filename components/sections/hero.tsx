// components/sections/hero.tsx
//
// The name, struck on keycaps as the page loads; under it, the role those keys type
// out, in mono with a caret; beside it the portrait as a sticker with the "open to
// work" seal slapped over its corner. One display voice — the keys.

import Image from "next/image"

import { KeyWord } from "@/components/keys/KeyWord"
import { Seal } from "@/components/keys/Seal"
import { Section } from "@/components/keys/Section"
import { TypedRole, type RoleSegment } from "@/components/keys/TypedRole"
import { profile } from "@/data/profile"

/** One keystroke on the keycaps — --k-stroke in app/keys.css, GREETING.typeMs. */
const STROKE_MS = 118

/** "Full-Stack Developer & UI/UX Designer", with the second role in neon. */
function roleSegments(title: string): RoleSegment[] {
  const [a, b] = title.split(" & ")
  return b ? [{ text: a }, { text: " & ", tone: "dim" }, { text: b, tone: "neon" }] : [{ text: title }]
}

export default function Hero() {
  const [first, ...rest] = profile.name.toUpperCase().split(" ")
  const last = rest.join(" ")
  return (
    <Section id="hero" labelledBy="hero-title" className="ks--hero" innerClassName="hero">
      <div className="hero__copy">
        {profile.available ? (
          <p className="status">
            <span className="status__led" aria-hidden="true" />
            {profile.availableLabel} · {profile.location}
          </p>
        ) : null}

        <h1 id="hero-title" className="hero__name">
          <span className="sr-only">{profile.name}</span>
          <KeyWord word={first} typeOnView />
          <KeyWord word={last} typeOnView offset={first.length} />
        </h1>

        <TypedRole
          segments={roleSegments(profile.title)}
          delayMs={(first.length + last.length) * STROKE_MS + 250}
        />

        <p className="hero__tagline">{profile.tagline}</p>

        <div className="hero__ctas">
          <a className="kc kc--enter kc--word" href="#projects">
            <span className="kc__mod" aria-hidden="true">
              ↵
            </span>
            <span>See the work</span>
          </a>
          <a className="kc kc--word" href="#contact">
            Get in touch
          </a>
        </div>

        <p className="hero__hint" aria-hidden="true">
          <span className="hint-desk">
            <kbd>⌘K</kbd> for everything — or just type, and watch the keys.
          </span>
          <span className="hint-touch">
            Tap <kbd>⌘K</kbd> up top for everything.
          </span>
        </p>
      </div>

      <figure className="peel">
        <div className="peel__portrait">
          <Image
            src={profile.portrait}
            alt={`Portrait of ${profile.name}`}
            fill
            priority
            sizes="(min-width: 960px) 22rem, 80vw"
          />
        </div>
        <Seal />
      </figure>
    </Section>
  )
}
