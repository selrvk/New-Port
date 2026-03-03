"use client"

import { motion, AnimatePresence } from "motion/react"
import { useState } from "react"
import { sortedCertifications, certCount, type Certification } from "@/data/certifications"

const SPRING = [0.16, 1, 0.3, 1] as const

const ISSUER_CODE: Record<string, string> = {
  "TESDA (Technical Education and Skills Development Authority)": "TESDA",
  "Cisco Networking Academy": "CISCO",
  "Johns Hopkins University": "JHU",
  "Board Infinity":           "BI",
  "Microsoft":                "MSFT",
}

const code = (issuer: string) => ISSUER_CODE[issuer] ?? issuer.slice(0, 4).toUpperCase()

const ALL_ISSUERS = ["All", ...Array.from(new Set(sortedCertifications.map(c => code(c.issuer))))]

export default function Certifications() {
  const [activeFilter, setActiveFilter] = useState("All")
  const [hoveredId,    setHoveredId]    = useState<string | null>(null)

  const filtered =
    activeFilter === "All"
      ? sortedCertifications
      : sortedCertifications.filter(c => code(c.issuer) === activeFilter)

  return (
    <section
      id="certifications"
      className="relative bg-ca-bg overflow-hidden"
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
            Licenses &amp; Certifications
          </span>
        </div>
        <div className="flex items-center gap-3 border-l border-ca-rule px-5 py-4">
          <span
            className="font-mono text-[0.6rem] tracking-[0.14em] text-ca-neon"
            style={{ textShadow: "0 0 8px rgba(232,255,71,0.5)" }}
          >
            {String(certCount).padStart(2, "0")}
          </span>
          <span className="font-mono text-[0.6rem] tracking-[0.14em] text-ca-muted">certs</span>
        </div>
      </div>

      <div className="px-6 py-12 md:px-14 lg:px-20">

        {/* ── Headline + filter row ── */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between mb-10">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: SPRING }}
          >
            <div className="flex items-center gap-4 mb-3">
              <span className="h-px w-8 bg-ca-neon opacity-60" />
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ca-neon">
                Certifications
              </span>
            </div>
            <h2 className="font-syne text-[clamp(2.2rem,6.5vw,5.5rem)] font-extrabold leading-[0.9] tracking-[-0.03em] text-ca-paper">
              PROOF OF
              <br />
              <span
                style={{
                  WebkitTextStroke: "2px #F0EDE6",
                  WebkitTextFillColor: "transparent",
                }}
              >
                WORK.
              </span>
            </h2>
          </motion.div>

          {/* Filter tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: SPRING, delay: 0.15 }}
            className="flex flex-wrap gap-2"
          >
            {ALL_ISSUERS.map((f) => {
              const isActive = activeFilter === f
              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className="font-mono px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.12em] border transition-all duration-200"
                  style={{
                    borderColor:  isActive ? "#E8FF47" : "#1E1E1E",
                    color:        isActive ? "#E8FF47" : "#6B6860",
                    background:   isActive ? "rgba(232,255,71,0.06)" : "transparent",
                    boxShadow:    isActive ? "0 0 10px rgba(232,255,71,0.12)" : "none",
                  }}
                >
                  {f}
                </button>
              )
            })}
          </motion.div>
        </div>

        {/* ── Cert grid ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
          >
            {filtered.map((cert, i) => (
              <CertCard
                key={cert.id}
                cert={cert}
                index={i}
                isHovered={hoveredId === cert.id}
                onHover={() => setHoveredId(cert.id)}
                onLeave={() => setHoveredId(null)}
              />
            ))}
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  )
}

function CertCard({
  cert,
  index,
  isHovered,
  onHover,
  onLeave,
}: {
  cert:      Certification
  index:     number
  isHovered: boolean
  onHover:   () => void
  onLeave:   () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.45, ease: SPRING, delay: index * 0.055 }}
      className="group relative flex flex-col border bg-ca-bg transition-colors duration-200"
      style={{
        borderColor: isHovered
          ? cert.featured ? "#E8FF47" : "#3A3A3A"
          : "#1E1E1E",
        boxShadow: isHovered
          ? cert.featured
            ? "0 0 24px rgba(232,255,71,0.08)"
            : "0 8px 24px rgba(0,0,0,0.4)"
          : "none",
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >

      {/* Featured accent — neon top border */}
      {cert.featured && (
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{
            background: "linear-gradient(90deg, #E8FF47, transparent)",
            opacity: isHovered ? 1 : 0.5,
            transition: "opacity 0.2s ease",
          }}
        />
      )}

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-3 p-5">

        {/* Top row: issuer code + date + featured badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[0.6rem] font-bold tracking-[0.1em]"
              style={{ color: cert.featured ? "#E8FF47" : "#6B6860" }}
            >
              {code(cert.issuer)}
            </span>
            <span className="font-mono text-[0.56rem] text-ca-muted opacity-50">·</span>
            <span className="font-mono text-[0.56rem] tracking-[0.1em] text-ca-muted">
              {cert.issued}
            </span>
          </div>

          {cert.featured && (
            <span
              className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-ca-neon"
              style={{ textShadow: "0 0 8px rgba(232,255,71,0.4)" }}
            >
              Featured
            </span>
          )}
        </div>

        {/* Cert name */}
        <h3 className="font-zen text-[1.2rem] font-light leading-tight tracking-[-0.01em] text-ca-paper">
          {cert.name}
        </h3>

        {/* Issuer full name */}
        <p className="font-jakarta text-[0.72rem] leading-snug text-ca-paper/50">
          {cert.issuer}
        </p>

        {/* Valid until */}
        {cert.validUntil && (
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-ca-neon"
              style={{ boxShadow: "0 0 6px rgba(232,255,71,0.6)" }}
            />
            <span className="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-ca-paper/50">
              Valid until {cert.validUntil}
            </span>
          </div>
        )}

        {/* Skills chips */}
        {cert.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {cert.skills.map((skill) => (
              <span
                key={skill}
                className="font-mono border border-ca-rule px-2 py-0.5 text-[0.55rem] uppercase tracking-wider text-ca-paper/40"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer: credential ID + verify link */}
      {(cert.credentialId || cert.credentialUrl) && (
        <div className="flex items-center justify-between gap-3 border-t border-ca-rule px-5 py-3">
          {cert.credentialId && (
            <span className="font-mono text-[0.52rem] tracking-[0.1em] text-ca-hot opacity-70 truncate">
              ID: {cert.credentialId}
            </span>
          )}
          {cert.credentialUrl && (
            <a
              href={cert.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono flex-shrink-0 text-[0.56rem] uppercase tracking-[0.12em] text-ca-muted transition-colors duration-200 hover:text-ca-neon"
            >
              Verify ↗
            </a>
          )}
        </div>
      )}

      {/* Left hover accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background: cert.featured ? "#E8FF47" : "#3A3A3A",
          boxShadow:  cert.featured ? "0 0 8px rgba(232,255,71,0.4)" : "none",
        }}
      />
    </motion.div>
  )
}