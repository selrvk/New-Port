// components/sections/education.tsx
//
// Side C — Origin: where it was made. Every school, most recent first.
//
// No school crests: data/education.ts currently gives every entry the same
// placeholder (the De La Salle seal), and showing it beside nine different schools
// would misstate where Charles studied. Add real crests there and they can return.

import { Panel } from "@/components/box/Panel"
import { education } from "@/data/education"

const newestFirst = [...education].reverse()

export default function Education() {
  return (
    <Panel id="education" labelledBy="education-title" tone="shade">
      <h2 id="education-title" className="box-display box-h2">
        Origin
      </h2>
      <p className="box-lede">Every school, most recent first.</p>

      <ol className="box-origin">
        {newestFirst.map((s) => (
          <li key={s.id}>
            <span className="box-origin__years">{s.year}</span>
            <div>
              <p className="box-origin__school">
                {s.school}
                {s.current ? <span className="box-now">Current</span> : null}
              </p>
              <p className="box-origin__level">{s.degree}</p>
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  )
}
