// components/sections/projects.tsx
//
// F1 — Projects: each one a browser window, as the 3D laptop's screen shows them,
// with its real address in the URL bar. The number key beside each title is the
// one that lights if you press it.

import Image from "next/image"

import { Section } from "@/components/keys/Section"
import { SectionHead } from "@/components/keys/SectionHead"
import { projects } from "@/data/projects"

const newTab = { target: "_blank", rel: "noopener noreferrer" } as const

/** "https://apps.apple.com/ph/app/x" → host and the rest, as an address bar shows them. */
function splitUrl(href: string): { host: string; rest: string } {
  try {
    const u = new URL(href)
    const rest = `${u.pathname === "/" ? "" : u.pathname}${u.search}`
    return { host: u.host, rest }
  } catch {
    return { host: href, rest: "" }
  }
}

export default function Projects() {
  const onStore = projects.filter((p) => p.demoLabel === "app store").length
  return (
    <Section id="projects" labelledBy="projects-title">
      <SectionHead id="projects" headingId="projects-title" meta={<span>{projects.length} open tabs</span>}>
        Apps, systems and sites — every one links to the real thing
        {onStore ? `, and ${onStore} are on the App Store` : ""}.
      </SectionHead>

      <ol className="wins">
        {projects.map((p, i) => {
          const url = splitUrl(p.demo)
          const titleId = `project-${p.id}`
          return (
            <li key={p.id}>
              <article className="win" aria-labelledby={titleId}>
                <div className="win__bar" aria-hidden="true">
                  <span className="win__tab">
                    <span className="win__dot" />
                    <span>{p.title}</span>
                  </span>
                </div>
                <p className="win__url" aria-hidden="true">
                  <span>
                    <b>{url.host}</b>
                    {url.rest}
                  </span>
                </p>
                <div className="win__shot">
                  <Image
                    src={p.image}
                    alt={`Screenshot of ${p.title}`}
                    fill
                    sizes="(min-width: 820px) 34rem, 92vw"
                  />
                </div>
                <div className="win__body">
                  <h3 className="win__title" id={titleId}>
                    <span className="kc kc--xs" aria-hidden="true" data-legend={String(i + 1)}>
                      {i + 1}
                    </span>
                    {p.title}
                  </h3>
                  <p className="win__desc">{p.description}</p>
                  <ul className="chips" aria-label="Built with">
                    {p.stack.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  <div className="win__links">
                    <a className="kc kc--enter kc--word" href={p.demo} {...newTab}>
                      <span>{p.demoLabel ?? "Live demo"}</span>
                      <span aria-hidden="true">↗</span>
                      <span className="sr-only"> for {p.title} (opens in a new tab)</span>
                    </a>
                    {p.source ? (
                      <a className="kc kc--word" href={p.source} {...newTab}>
                        <span>Source</span>
                        <span aria-hidden="true">↗</span>
                        <span className="sr-only"> code for {p.title} (opens in a new tab)</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            </li>
          )
        })}
      </ol>
    </Section>
  )
}
