"use client"

import { motion } from "motion/react"
import { useState } from "react"

const SPRING = [0.16, 1, 0.3, 1] as const

// ── Contact entries ────────────────────────────────────────────────────────────
const CONTACT = [
  {
    label:  "Email",
    value:  "selrvk@gmail.com",
    href:   "mailto:selrvk@gmail.com",
    code:   "01",
    action: "Send email",
  },
  {
    label:  "Phone",
    value:  "+63 939 354 7380",
    href:   "tel:+639393547380",
    code:   "02",
    action: "Call",
  },
]

const SOCIALS = [
  {
    label: "GitHub",
    value: "github.com/selrvk",
    href:  "https://github.com/selrvk",
    code:  "GH",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/charles-alcantara",
    href:  "https://linkedin.com/in/charles-alcantara",
    code:  "LI",
  },
  {
    label: "Instagram",
    value: "instagram.com/selrvk",
    href:  "https://instagram.com/selrvk",
    code:  "IG",
  },
  {
    label: "Discord",
    value: "selrvk",
    href:  "https://discord.com/users/selrvk",
    code:  "DC",
  },
]

export default function Contact() {
  return (
    <section
      id="contact"
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
          <span className="font-mono text-[0.6rem] tracking-[0.14em] text-ca-muted">007</span>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-4">
          <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.28em] text-ca-muted">
            Contact
          </span>
        </div>
        <div className="flex items-center border-l border-ca-rule px-5 py-4">
          <span className="font-mono text-[0.6rem] tracking-[0.14em] text-ca-muted">2026</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-53px)]">

        {/* ── LEFT: closing statement ── */}
        <div className="flex flex-1 flex-col justify-between border-r border-ca-rule px-6 py-12 md:px-14 lg:px-20">

          {/* Big headline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: SPRING }}
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="h-px w-8 bg-ca-neon opacity-60" />
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ca-neon">
                Let's Talk
              </span>
            </div>

            <h2 className="font-syne text-[clamp(2.8rem,8vw,7rem)] font-extrabold leading-[0.88] tracking-[-0.03em] text-ca-paper">
              GOT A
              <br />
              PROJECT
              <br />
              <span
                style={{
                  WebkitTextStroke: "2px #F0EDE6",
                  WebkitTextFillColor: "transparent",
                }}
              >
                IN MIND?
              </span>
            </h2>

            <p className="font-jakarta mt-8 max-w-[38ch] text-sm leading-relaxed text-ca-muted">
              I'm open to freelance work, collaborations, and full-time opportunities.
              Whether it's a product idea, a design system, or just a conversation —
              {" "}<span className="text-ca-paper font-medium">reach out.</span>
            </p>
          </motion.div>

          {/* Status + availability */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: SPRING, delay: 0.2 }}
            className="mt-12 flex items-center gap-4 border-t border-ca-rule pt-6"
          >
            <span
              className="inline-block h-2 w-2 rounded-full bg-ca-neon flex-shrink-0"
              style={{ boxShadow: "0 0 8px rgba(232,255,71,0.8)" }}
            />
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ca-muted">
              Currently available for work
            </span>
          </motion.div>
        </div>

        {/* ── RIGHT: contact details ── */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: SPRING, delay: 0.15 }}
          className="flex flex-col lg:w-[44%] xl:w-[42%]"
        >

          {/* Direct contact rows */}
          <div className="border-b border-ca-rule">
            <div className="border-b border-ca-rule px-6 py-3">
              <span className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-ca-muted">
                Direct
              </span>
            </div>

            {CONTACT.map((item, i) => (
              <ContactRow key={item.code} item={item} index={i} last={i === CONTACT.length - 1} />
            ))}
          </div>

          {/* Social rows */}
          <div className="flex-1">
            <div className="border-b border-ca-rule px-6 py-3">
              <span className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-ca-muted">
                Platforms
              </span>
            </div>

            <div className="grid grid-cols-2">
              {SOCIALS.map((social, i) => (
                <SocialCell key={social.code} social={social} index={i} total={SOCIALS.length} />
              ))}
            </div>
          </div>

          {/* CTA — primary email button */}
          <div className="border-t border-ca-rule p-6">
            <a
              href="mailto:selrvk@gmail.com"
              className="group flex w-full items-center justify-between border border-ca-neon bg-ca-neon px-6 py-4 font-syne text-[0.8rem] font-bold uppercase tracking-[0.12em] text-ca-bg"
              style={{ transition: "opacity 0.2s ease, transform 0.15s ease, box-shadow 0.15s ease" }}
              onMouseEnter={e => {
                const el = e.currentTarget
                el.style.transform = "translate(-3px,-3px)"
                el.style.boxShadow = "3px 3px 0 0 #F0EDE6"
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                el.style.transform = "translate(0,0)"
                el.style.boxShadow = "none"
              }}
            >
              Send me an email
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                className="transition-transform duration-200 group-hover:translate-x-1">
                <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          FOOTER — closes the entire page
      ══════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-ca-rule">

        {/* Marquee */}
        <div className="overflow-hidden border-b border-ca-rule py-2.5">
          <div
            className="flex whitespace-nowrap"
            style={{ animation: "marquee-x 24s linear infinite" }}
          >
            {Array(10).fill(null).map((_, i) => (
              <span key={i} className="mx-8 inline-flex items-center gap-8">
                <span className="font-syne text-[0.6rem] font-bold uppercase tracking-[0.22em] text-ca-rule">
                  Charles Alcantara
                </span>
                <span className="text-[5px] text-ca-neon">◆</span>
                <span className="font-syne text-[0.6rem] font-bold uppercase tracking-[0.22em] text-ca-rule">
                  Full-Stack Developer
                </span>
                <span className="text-[5px] text-ca-hot">◆</span>
                <span className="font-syne text-[0.6rem] font-bold uppercase tracking-[0.22em] text-ca-rule">
                  UI/UX Designer
                </span>
                <span className="text-[5px] text-ca-neon">◆</span>
              </span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-start justify-between gap-4 px-6 py-5 md:flex-row md:items-center md:px-14">
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-ca-muted">
            © 2026 Charles Alcantara. All rights reserved.
          </span>

          <div className="flex items-center gap-6">
            {["GitHub", "LinkedIn", "Instagram"].map((label) => (
              <a
                key={label}
                href={
                  label === "GitHub" ? "https://github.com/selrvk"
                  : label === "LinkedIn" ? "https://linkedin.com/in/charles-alcantara"
                  : "https://instagram.com/selrvk"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-ca-muted transition-colors duration-200 hover:text-ca-paper"
              >
                {label}
              </a>
            ))}
          </div>

          <span className="font-mono text-[0.58rem] tracking-[0.1em] text-ca-muted opacity-40">
            Designed &amp; built by Charles
          </span>
        </div>

      </footer>
    </section>
  )
}

// ── Contact row with copy-to-clipboard ────────────────────────────────────────
function ContactRow({
  item,
  index,
  last,
}: {
  item: (typeof CONTACT)[number]
  index: number
  last: boolean
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: SPRING, delay: 0.1 + index * 0.1 }}
      className={`group flex items-center justify-between gap-4 px-6 py-5 transition-colors duration-200 hover:bg-[#0D0D0D] ${
        !last ? "border-b border-ca-rule" : ""
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <span className="font-mono text-[0.56rem] tracking-[0.1em] text-ca-muted flex-shrink-0">
          {item.code}
        </span>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-mono text-[0.52rem] uppercase tracking-[0.14em] text-ca-muted">
            {item.label}
          </span>
          <a
            href={item.href}
            className="font-syne text-sm font-bold text-ca-paper truncate transition-colors duration-200 hover:text-ca-neon"
            style={{ textDecoration: "none" }}
          >
            {item.value}
          </a>
        </div>
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="flex-shrink-0 border border-ca-rule px-3 py-1.5 font-mono text-[0.56rem] uppercase tracking-[0.12em] text-ca-muted opacity-0 transition-all duration-200 group-hover:opacity-100"
        style={{
          color: copied ? "#E8FF47" : undefined,
          borderColor: copied ? "#E8FF47" : undefined,
          boxShadow: copied ? "0 0 8px rgba(232,255,71,0.2)" : "none",
          transition: "opacity 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
    </motion.div>
  )
}

// ── Social cell ────────────────────────────────────────────────────────────────
function SocialCell({
  social,
  index,
  total,
}: {
  social: (typeof SOCIALS)[number]
  index: number
  total: number
}) {
  const isRightCol   = index % 2 === 1
  const isBottomRow  = index >= total - 2

  return (
    <motion.a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: SPRING, delay: 0.15 + index * 0.08 }}
      className="group flex flex-col gap-2 p-5 transition-colors duration-200 hover:bg-[#0D0D0D]"
      style={{
        borderRight:  !isRightCol   ? "1px solid #1E1E1E" : "none",
        borderBottom: !isBottomRow  ? "1px solid #1E1E1E" : "none",
        textDecoration: "none",
      }}
    >
      <span
        className="font-mono text-[0.65rem] font-bold tracking-[0.1em] transition-colors duration-200"
        style={{ color: "#6B6860" }}
        onMouseEnter={() => {}}
      >
        <span className="group-hover:text-ca-neon transition-colors duration-200">
          {social.code}
        </span>
      </span>
      <span className="font-syne text-[0.8rem] font-bold text-ca-paper">
        {social.label}
      </span>
      <span className="font-mono text-[0.56rem] truncate text-ca-muted opacity-60">
        {social.value}
      </span>
    </motion.a>
  )
}