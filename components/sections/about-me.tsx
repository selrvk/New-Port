"use client"

import { motion, AnimatePresence } from "motion/react"
import { useState } from "react"
import Image from "next/image"

const SPRING = [0.16, 1, 0.3, 1] as const

// ── Quick-scan stat chips ──────────────────────────────────────────────────────
const STATS = [
  { label: "Status",       value: "Undergraduate"          },
  { label: "University",   value: "LPU – Batangas"         },
  { label: "Degree",       value: "BS Information Technology" },
  { label: "Certified",    value: "Visual Graphics Designer" },
  { label: "Based in",     value: "Philippines"             },
  { label: "Available",    value: "Open to work"            },
]

// ── Extended bio paragraphs ────────────────────────────────────────────────────
const EXTENDED = [
  "I began my journey studying BS-Software Technology at De La Salle University, and I am currently pursuing BS-Information Technology at Lyceum of the Philippines University – Batangas. My academic background combined with hands-on project experience has shaped my ability to work across the entire development stack.",
  "I'm proficient in a wide range of languages and frameworks — from crafting intuitive user interfaces to architecting robust backend systems, RESTful APIs, and both SQL and NoSQL databases. I also have experience in system design, deployment pipelines, and version control with Git.",
  "As a nationally certified Visual Graphics Designer, I bring a strong sense of UI/UX — blending technical precision with meaningful design. Whether in Agile or Waterfall environments, I communicate clearly, work efficiently, and prioritize reliability in every project.",
  "Driven, adaptable, and eager to grow. My goal is to build products that solve real problems, perform flawlessly, and deliver exceptional experiences for both users and clients.",
]

export default function AboutMe() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <section
      id="about-me"
      className="relative min-h-screen bg-ca-bg overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(#1E1E1E 1px, transparent 1px), linear-gradient(90deg, #1E1E1E 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    >
      {/* ── Section header bar ── */}
      <div className="flex items-stretch border-b border-ca-rule">
        <div className="flex items-center border-r border-ca-rule px-5 py-4">
          <span className="font-mono text-[0.6rem] tracking-[0.14em] text-ca-muted">005</span>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-4">
          <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.28em] text-ca-muted">
            About Me
          </span>
        </div>
        <div className="flex items-center border-l border-ca-rule px-5 py-4">
          <span className="font-mono text-[0.6rem] tracking-[0.14em] text-ca-muted">2026</span>
        </div>
      </div>

      {/* ── Body: left content | right photo ── */}
      <div className="flex min-h-[calc(100vh-53px)] flex-col md:flex-row">

        {/* ── LEFT ── */}
        <div className="flex flex-1 flex-col justify-between border-r border-ca-rule px-6 py-10 md:px-14 lg:px-20">

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: SPRING }}
          >
            <div className="flex items-center gap-4 mb-3">
              <span className="h-px w-8 bg-ca-neon opacity-60" />
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ca-neon">
                About
              </span>
            </div>
            <h2 className="font-syne text-[clamp(2.2rem,6.5vw,5.5rem)] font-extrabold leading-[0.9] tracking-[-0.03em] text-ca-paper">
              WHO I
              <br />
              <span
                style={{
                  WebkitTextStroke: "2px #F0EDE6",
                  WebkitTextFillColor: "transparent",
                }}
              >
                AM.
              </span>
            </h2>
          </motion.div>

          {/* Stat chips grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: SPRING, delay: 0.15 }}
            className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3"
          >
            {STATS.map(({ label, value }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: SPRING, delay: 0.2 + i * 0.06 }}
                className="flex flex-col gap-1 border border-ca-rule bg-ca-bg p-3"
                style={{ transition: "border-color 0.2s ease" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#3A3A3A")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#1E1E1E")}
              >
                <span className="font-mono text-[0.52rem] uppercase tracking-[0.16em] text-ca-muted">
                  {label}
                </span>
                <span className="font-syne text-[0.78rem] font-bold text-ca-paper leading-tight">
                  {value}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: SPRING, delay: 0.25 }}
            className="mt-10 border-t border-ca-rule pt-8"
          >
            {/* Comment label */}
            <p className="font-mono mb-4 text-[0.6rem] text-ca-muted">
              <span className="text-ca-neon opacity-60">{"/*"}</span>
              {" "}bio.txt{" "}
              <span className="text-ca-neon opacity-60">{"*/"}</span>
            </p>

            {/* Lead paragraph — always visible */}
            <p className="font-jakarta text-sm leading-relaxed text-ca-muted">
              Hi, I'm{" "}
              <span className="font-semibold text-ca-paper">Charles</span>{" "}
              — a full-stack web developer with a strong foundation in software engineering
              and a passion for building clean, scalable, and user-centered digital products.
            </p>

            {/* Expandable paragraphs */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 space-y-4">
                    {EXTENDED.map((para, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: SPRING, delay: i * 0.08 }}
                        className="font-jakarta text-sm leading-relaxed text-ca-muted"
                      >
                        {para}
                      </motion.p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-6 flex items-center gap-2 border border-ca-rule px-4 py-2.5 font-syne text-[0.72rem] font-bold uppercase tracking-[0.1em] text-ca-muted"
              style={{ transition: "border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease" }}
              onMouseEnter={e => {
                const el = e.currentTarget
                el.style.borderColor = "#E8FF47"
                el.style.color = "#E8FF47"
                el.style.boxShadow = "0 0 12px rgba(232,255,71,0.12)"
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                el.style.borderColor = "#1E1E1E"
                el.style.color = "#6B6860"
                el.style.boxShadow = "none"
              }}
            >
              <span>{isExpanded ? "Show Less" : "Read More"}</span>
              <motion.svg
                width="10" height="10" viewBox="0 0 10 10" fill="none"
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3, ease: SPRING }}
              >
                <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </motion.svg>
            </button>
          </motion.div>

          {/* Spacer */}
          <div className="mt-10 flex items-center gap-3 border-t border-ca-rule pt-6">
            <span className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-ca-muted opacity-50">
              charles.alcantara — portfolio 2026
            </span>
          </div>
        </div>

        {/* ── RIGHT: photo panel ── */}
        <motion.aside
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: SPRING, delay: 0.2 }}
          className="relative hidden md:flex md:w-[38%] lg:w-[42%] flex-col border-l border-ca-rule"
        >
          {/* Photo — same treatment as hero */}
          <div
            className="relative flex-1 overflow-hidden"
            style={{ minHeight: "500px" }}
          >
            <Image
              src="/pictures/my-closeup.png"
              alt="Charles Alcantara"
              fill
              className="object-cover object-top"
              style={{ filter: "contrast(1.1) saturate(0) brightness(0.9)" }}
            />

            {/* Duotone wash */}
            <div
              aria-hidden
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background: "linear-gradient(150deg, rgba(255,45,107,0.22) 0%, rgba(232,255,71,0.10) 100%)",
                mixBlendMode: "color",
              }}
            />

            {/* Scanlines */}
            <div
              aria-hidden
              className="absolute inset-0 z-20 pointer-events-none"
              style={{
                background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(8,12,20,0.12) 3px, rgba(8,12,20,0.12) 4px)",
              }}
            />

            {/* Bottom vignette */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 z-30 h-40 pointer-events-none"
              style={{ background: "linear-gradient(to top, #0A0A0A, transparent)" }}
            />

            {/* Hot pink corner — matches hero */}
            <div
              aria-hidden
              className="absolute right-0 top-0 z-40 h-14 w-14"
              style={{
                background: "#FF2D6B",
                clipPath: "polygon(100% 0, 0 0, 100% 100%)",
              }}
            />

            {/* Vertical label */}
            <div
              className="absolute left-4 top-1/2 z-40 -translate-y-1/2"
              style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}
            >
              <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-ca-muted opacity-50">
                Charles Alcantara · Developer & Designer
              </span>
            </div>

            {/* Bottom caption */}
            <div className="absolute bottom-4 right-5 z-40 text-right">
              <p className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-ca-muted opacity-60">
                Manila, PH
              </p>
            </div>
          </div>
        </motion.aside>

      </div>
    </section>
  )
}