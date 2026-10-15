// components/sections/about-me.tsx
//
// F5 — About: as the 3D screen shows it, `whoami` first, then the README. The words
// are Charles's own, from data/about.ts, unedited.

import { Section } from "@/components/keys/Section"
import { SectionHead } from "@/components/keys/SectionHead"
import { aboutLead, aboutParagraphs, whoami } from "@/data/about"
import { profile } from "@/data/profile"

export default function AboutMe() {
  return (
    <Section id="about-me" labelledBy="about-title">
      <SectionHead id="about-me" headingId="about-title" meta={<span>~/charles/README.md</span>} />

      <div className="about">
        <div className="term">
          <p className="term__bar">~ — zsh</p>
          <div className="term__body">
            <p className="term__cmd">whoami</p>
            <dl className="term__kv">
              {whoami.map(([k, v]) => (
                <div key={k} style={{ display: "contents" }}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <article className="readme" aria-labelledby="readme-title">
          <p className="readme__tab">README.md</p>
          <div className="readme__body">
            <h3 className="readme__h" id="readme-title">
              {profile.name}
            </h3>
            <p className="readme__lead">
              {aboutLead.greeting} <strong>{aboutLead.name}</strong>{" "}
              <span className="k-mono k-dim">{aboutLead.pronunciation}</span> {aboutLead.rest}
            </p>
            {aboutParagraphs.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>
        </article>
      </div>
    </Section>
  )
}
