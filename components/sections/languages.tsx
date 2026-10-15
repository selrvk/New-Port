// components/sections/languages.tsx
//
// Side D — Languages: the multilingual strip every box is printed with, one column
// per language, each greeting in its own language (and marked up as such, so screen
// readers pronounce it correctly).

import { Panel } from "@/components/box/Panel"
import { languages } from "@/data/languages"

export default function Languages() {
  return (
    <Panel id="languages" labelledBy="languages-title" tone="shade">
      <h2 id="languages-title" className="box-display box-h2">
        Available in {languages.length} languages
      </h2>

      <ul className="box-langs">
        {languages.map((l) => (
          <li key={l.code} className="box-lang">
            <span className="box-lang__code" aria-hidden="true">
              {l.code}
            </span>
            <p className="box-display box-lang__greeting" lang={l.tag}>
              {l.greeting}
            </p>
            <p className="box-lang__name">
              {l.name}
              {l.endonym !== l.name ? (
                <>
                  {" · "}
                  <span lang={l.tag}>{l.endonym}</span>
                </>
              ) : null}
            </p>
            <p className="box-lang__level">
              {l.level} — {l.note}
            </p>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
