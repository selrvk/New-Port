// components/sections/about-me.tsx
//
// Insert — Read me first: the leaflet folded inside the box. Plain white paper
// rather than board, folded down the middle on wide screens. The words are Charles's
// own, from data/about.ts, unedited.

import { Panel } from "@/components/box/Panel"
import { aboutLead, aboutParagraphs, aboutStats } from "@/data/about"

export default function AboutMe() {
  return (
    <Panel id="about-me" labelledBy="about-title" tone="insert">
      <div className="box-leaflet">
        <div>
          <h2 id="about-title" className="box-display box-h2">
            Read me first
          </h2>
          <p className="box-leaflet__lead">
            {aboutLead.greeting} <strong>{aboutLead.name}</strong>{" "}
            <span className="box-mono">{aboutLead.pronunciation}</span> {aboutLead.rest}
          </p>
          {aboutParagraphs.map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
        </div>

        <aside aria-labelledby="about-glance">
          <p id="about-glance" className="box-label">
            At a glance
          </p>
          <dl className="box-facts">
            {aboutStats.map((s) => (
              <div key={s.label}>
                <dt className="box-label">{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </Panel>
  )
}
