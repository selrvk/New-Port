// components/sections/projects.tsx
//
// Side A — Contents: what's in the box, as a numbered contents list. The screenshots
// are the real projects; the crop marks around them are the only decoration.

import Image from "next/image"

import { Panel } from "@/components/box/Panel"
import { projects } from "@/data/projects"

const newTab = { target: "_blank", rel: "noopener noreferrer" } as const

export default function Projects() {
  return (
    <Panel id="projects" labelledBy="projects-title">
      <h2 id="projects-title" className="box-display box-h2">
        What&rsquo;s in the box
      </h2>
      <p className="box-lede">
        {projects.length} items, each with a link to the real thing.
      </p>

      <ol className="box-contents">
        {projects.map((p, i) => (
          <li key={p.id}>
            <div className="box-crop">
              <div className="box-item__shot">
                <Image
                  src={p.image}
                  alt={`Screenshot of ${p.title}`}
                  fill
                  sizes="(min-width: 760px) 34rem, 90vw"
                />
              </div>
            </div>
            <div className="box-item__head">
              {/* The list already conveys order to assistive tech. */}
              <span className="box-item__no" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="box-item__title">{p.title}</h3>
            </div>
            <p className="box-item__desc">{p.description}</p>
            <p className="box-item__stack box-mono">
              <span className="box-label">Built with </span>
              {p.stack.join(" · ")}
            </p>
            <div className="box-tabs">
              <a className="box-tab box-tab--sm box-tab--spot" href={p.demo} {...newTab}>
                {p.demoLabel ?? "Live demo"}
                <span className="sr-only"> for {p.title} (opens in a new tab)</span>
                <span aria-hidden="true">↗</span>
              </a>
              {p.source ? (
                <a className="box-tab box-tab--sm" href={p.source} {...newTab}>
                  Source
                  <span className="sr-only"> code for {p.title} (opens in a new tab)</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  )
}
