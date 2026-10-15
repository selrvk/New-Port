// components/sections/hero.tsx
//
// Front panel: the product name, the product line reversed out of an ink band, and
// the product itself shown through a die-cut window — with the neon seal stuck on.

import Image from "next/image"

import { Panel } from "@/components/box/Panel"
import { Seal } from "@/components/box/Seal"
import { profile } from "@/data/profile"

export default function Hero() {
  const [first, ...rest] = profile.name.split(" ")
  return (
    <Panel id="hero" labelledBy="hero-title">
      <div className="box-front">
        <div className="box-front__copy">
          <h1 id="hero-title" className="box-display box-front__name">
            <span>{first}</span>
            <span>{rest.join(" ")}</span>
          </h1>
          <p className="box-band">{profile.title}</p>
          <p className="box-front__tagline">{profile.tagline}</p>

          <p className="box-label">Works with</p>
          <ul className="box-works">
            {profile.focus.map((tool) => (
              <li key={tool} className="box-chip">
                {tool}
              </li>
            ))}
          </ul>

          <div className="box-tabs">
            <a className="box-tab box-tab--spot" href="#projects">
              See what&rsquo;s inside <span aria-hidden="true">→</span>
            </a>
            <a className="box-tab" href="#contact">
              Get in touch
            </a>
          </div>
        </div>

        <figure className="box-window-wrap">
          <div className="box-window">
            <Image
              src={profile.portrait}
              alt={`Portrait of ${profile.name}`}
              fill
              priority
              sizes="(min-width: 900px) 26rem, 90vw"
            />
          </div>
          <Seal />
          <figcaption className="box-label box-window-caption">{profile.location}</figcaption>
        </figure>
      </div>
    </Panel>
  )
}
