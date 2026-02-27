import LogoLoop from "./LogoLoop"
import {
  SiReact, SiNextdotjs, SiTypescript, SiTailwindcss,
  SiPhp, SiHtml5, SiCss3, SiNodedotjs, SiSupabase,
} from "react-icons/si"

type Project = {
  title: string
  description: string
  image: string
  stack: string[]
  demo: string
  source: string
}

const techLogos = [
  { node: <SiReact      style={{ color: "#E8FF47", opacity: 0.7 }} />, title: "React",       href: "https://react.dev" },
  { node: <SiNextdotjs  style={{ color: "#E8FF47", opacity: 0.7 }} />, title: "Next.js",     href: "https://nextjs.org" },
  { node: <SiTypescript style={{ color: "#E8FF47", opacity: 0.7 }} />, title: "TypeScript",  href: "https://www.typescriptlang.org" },
  { node: <SiTailwindcss style={{ color: "#E8FF47", opacity: 0.7 }}/>, title: "Tailwind CSS",href: "https://tailwindcss.com" },
  { node: <SiPhp        style={{ color: "#E8FF47", opacity: 0.7 }} />, title: "Php",         href: "https://php.net" },
  { node: <SiCss3       style={{ color: "#E8FF47", opacity: 0.7 }} />, title: "CSS3",        href: "https://www.w3schools.com/css/" },
  { node: <SiHtml5      style={{ color: "#E8FF47", opacity: 0.7 }} />, title: "HTML5",       href: "https://www.w3schools.com/html/" },
  { node: <SiNodedotjs  style={{ color: "#E8FF47", opacity: 0.7 }} />, title: "NodeJS",      href: "https://nodejs.org/en" },
  { node: <SiSupabase   style={{ color: "#E8FF47", opacity: 0.7 }} />, title: "Supabase",    href: "https://supabase.com/" },
]

export default function CarouselCard({
  project,
  isActive,
}: {
  project: Project
  isActive?: boolean
}) {
  const filteredLogos = techLogos.filter((logo) =>
    project.stack.includes(logo.title)
  )

  return (
    <div
      className="relative flex flex-col bg-ca-bg overflow-hidden"
      style={{
        border: isActive ? "1px solid #3A3A3A" : "1px solid #1E1E1E",
        boxShadow: isActive
          ? "0 0 0 1px #1E1E1E, 0 24px 48px rgba(0,0,0,0.6)"
          : "none",
      }}
    >
      <div
        aria-hidden
        className="absolute right-0 top-0 z-10 h-10 w-10"
        style={{
          background: "#FF2D6B",
          clipPath: "polygon(100% 0, 0 0, 100% 100%)",
        }}
      />

      {/* ── Project image ── */}
      <div className="relative w-full overflow-hidden border-b border-ca-rule" style={{ aspectRatio: "16/9" }}>
        <img
          src={project.image}
          alt={project.title}
          className="h-full w-full object-cover"
          style={{ filter: "contrast(1.05) brightness(0.9)" }}
        />
        {/* Scanline overlay — echoes hero photo treatment */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(8,12,20,0.12) 3px, rgba(8,12,20,0.12) 4px)",
          }}
        />
        {/* Bottom fade into card */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
          style={{ background: "linear-gradient(to top, #0A0A0A, transparent)" }}
        />
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col gap-4 p-5">

        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-syne text-xl font-extrabold leading-tight tracking-[-0.02em] text-ca-paper">
            {project.title}
          </h2>
          {isActive && (
            <span
              className="font-mono mt-0.5 flex-shrink-0 text-[0.55rem] uppercase tracking-[0.16em] text-ca-neon"
              style={{ textShadow: "0 0 10px rgba(232,255,71,0.5)" }}
            >
              Featured
            </span>
          )}
        </div>

        {/* Description */}
        <p className="font-jakarta text-sm leading-relaxed text-ca-muted">
          {project.description}
        </p>

        {/* Tech logo loop */}
        {filteredLogos.length > 0 && (
          <div className="border-t border-ca-rule pt-4">
            <p className="font-mono mb-2 text-[0.54rem] uppercase tracking-[0.18em] text-ca-muted">
              Stack
            </p>
            <LogoLoop
              logos={filteredLogos}
              speed={18}
              direction="left"
              logoHeight={18}
              gap={24}
              hoverSpeed={0}
              scaleOnHover
              fadeOut
              fadeOutColor="#0A0A0A"
              ariaLabel="Tech stack"
            />
          </div>
        )}

        <div className="flex gap-3 border-t border-ca-rule pt-4">
          <a
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="
              group relative flex-1 overflow-hidden
              font-syne text-[0.72rem] font-bold uppercase tracking-[0.1em]
              bg-ca-neon text-ca-bg
              flex items-center justify-center gap-1.5
              py-2.5 px-4
              transition-all duration-150
              hover:-translate-x-[2px] hover:-translate-y-[2px]
              active:translate-x-0 active:translate-y-0
            "
            style={{
              transition: "transform 0.14s ease, box-shadow 0.14s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "2px 2px 0 0 #F0EDE6")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
          >
            Live Demo
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none" className="transition-transform duration-150 group-hover:translate-x-0.5">
              <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          <a
            href={project.source}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex-1
              font-syne text-[0.72rem] font-bold uppercase tracking-[0.1em]
              border border-ca-rule text-ca-muted
              flex items-center justify-center gap-1.5
              py-2.5 px-4
              transition-all duration-180
              hover:border-[#3A3A3A] hover:bg-[#1A1A1A] hover:text-ca-paper
            "
          >
            Source
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="#6B6860" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

      </div>
    </div>
  )
}