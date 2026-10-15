// components/sections/education.tsx
//
// F4 — Schools: the 3D version renders these as a CHANGELOG, each school a version
// (data/education.ts carries the tags). Here they are a git log, newest first, with
// HEAD on the school Charles is at now.
//
// No school crests: data/education.ts gives every entry the same placeholder (the
// De La Salle seal), and showing it beside nine different schools would misstate
// where Charles studied.

import { Section } from "@/components/keys/Section"
import { SectionHead } from "@/components/keys/SectionHead"
import { education } from "@/data/education"

const newestFirst = [...education].reverse()

export default function Education() {
  return (
    <Section id="education" labelledBy="education-title">
      <SectionHead
        id="education"
        headingId="education-title"
        meta={<span>git log --tags</span>}
      >
        {education.length} schools, from nursery to now. Newest first.
      </SectionHead>

      <ol className="glog">
        {newestFirst.map((s) => (
          <li key={s.id} data-head={s.current ? "" : undefined}>
            <span className="glog__node" aria-hidden="true" />
            <div>
              <p className="glog__refs">
                {s.current ? <span className="glog__head">HEAD → now</span> : null}
                <span className="glog__tag">tag: {s.version}</span>
                <span className="k-dim">{s.year}</span>
              </p>
              <p className="glog__msg">{s.school}</p>
              <p className="glog__sub">{s.degree}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}
