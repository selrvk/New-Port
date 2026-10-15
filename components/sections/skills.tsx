// components/sections/skills.tsx
//
// Side B — Specifications: the spec table every box carries. Read from
// data/skills-map.ts, the same source as the 3D command palette, so the two never
// describe different people. Anything still being learned is marked as such.

import { Fragment } from "react"

import { Panel } from "@/components/box/Panel"
import { skillCategories } from "@/data/skills-map"

/** Groups in the order they first appear, as data/skills.ts orders them. */
const groups = Array.from(new Set(skillCategories.map((c) => c.group)))
const anyLearning = skillCategories.some((c) => c.skills.some((s) => s.learning))

export default function Skills() {
  return (
    <Panel id="skills" labelledBy="skills-title" tone="shade">
      <h2 id="skills-title" className="box-display box-h2">
        Specifications
      </h2>

      <div className="box-spec">
        {groups.map((group) => (
          <div key={group}>
            <h3 className="box-spec__group">{group}</h3>
            <dl className="box-spec__rows">
              {skillCategories
                .filter((c) => c.group === group)
                .map((c) => (
                  <div key={c.id} className="box-spec__row">
                    <dt>{c.label}</dt>
                    <dd>
                      {c.skills.map((s, i) => (
                        <Fragment key={s.name}>
                          {i > 0 ? " · " : null}
                          {s.name}
                          {s.learning ? (
                            <>
                              <span aria-hidden="true">†</span>
                              <span className="sr-only"> (currently learning)</span>
                            </>
                          ) : null}
                        </Fragment>
                      ))}
                    </dd>
                  </div>
                ))}
            </dl>
          </div>
        ))}
      </div>
      {anyLearning ? (
        <p className="box-spec__note box-label" aria-hidden="true">
          † Currently learning
        </p>
      ) : null}
    </Panel>
  )
}
