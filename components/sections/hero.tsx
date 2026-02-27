'use client'

import { motion, Variants } from "motion/react"
import Image from "next/image"
import { useState, useEffect } from "react"

const SPRING = [0.16, 1, 0.3, 1] as const

function useScramble(target: string, startDelay = 300) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%"
  const randomChar = () => chars[Math.floor(Math.random() * chars.length)]

  const [output, setOutput] = useState(() =>
    target.split("").map((c) => (c === " " || c === "-" ? c : randomChar())).join("")
  )

  useEffect(() => {
    let frame = 0
    const total = 20
    const timeout = setTimeout(() => {
      const id = setInterval(() => {
        frame++
        setOutput(
          target.split("").map((char, i) => {
            if (char === " " || char === "-") return char
            if (i < (frame / total) * target.length) return char
            return randomChar()
          }).join("")
        )
        if (frame >= total) clearInterval(id)
      }, 42)
      return () => clearInterval(id)
    }, startDelay)
    return () => clearTimeout(timeout)
  }, [target, startDelay])

  return output
}

const slideUpVariants: Variants = {
  hidden: { y: "105%", opacity: 0 },
  show:   { y: "0%",   opacity: 1 },
}

const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1 },
}

const slideTransition = (delay: number) => ({
  duration: 0.7,
  ease: SPRING,
  delay,
})

const fadeTransition = (delay: number) => ({
  duration: 0.55,
  ease: "easeOut" as const,
  delay,
})

export default function Hero() {
  const line1 = useScramble("FULL-STACK",  500)
  const line2 = useScramble("DEVELOPER",   700)
  const line3 = useScramble("& UI/UX",     900)
  const line4 = useScramble("DESIGNER",   1100)

  const headlines = [
    { text: line1, outline: false, accent: false, delay: 0.00 },
    { text: line2, outline: false, accent: true,  delay: 0.09 },
    { text: line3, outline: false, accent: false, delay: 0.18 },
    { text: line4, outline: true,  accent: false, delay: 0.27 },
  ]

  return (
    <>
      <style>{`
        /* ── Grid background ── */
        .brutal-grid {
          background-color: #0A0A0A;
          background-image:
            linear-gradient(#1E1E1E 1px, transparent 1px),
            linear-gradient(90deg, #1E1E1E 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* ── Photo duotone ── */
        .photo-img {
          filter: contrast(1.15) saturate(0) brightness(0.95);
        }
        .photo-tint::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(150deg, rgba(255,45,107,0.30) 0%, rgba(232,255,71,0.15) 100%);
          mix-blend-mode: color;
          pointer-events: none;
          z-index: 2;
        }
        .photo-vignette::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, #0A0A0A 0%, transparent 45%);
          pointer-events: none;
          z-index: 3;
        }

        /* ── Typography effects ── */
        .text-outline-paper {
          -webkit-text-stroke: 2px #F0EDE6;
          -webkit-text-fill-color: transparent;
        }
        .text-glow-neon {
          text-shadow: 0 0 25px rgba(232,255,71,0.45), 0 0 70px rgba(232,255,71,0.12);
        }

        /* ── Neon dot pulse ── */
        .dot-glow {
          box-shadow: 0 0 8px 2px rgba(232,255,71,0.85);
        }

        /* ── Left accent bar on tag panel ── */
        .tag-panel {
          border-left: 3px solid #E8FF47;
          box-shadow: -4px 0 14px rgba(232,255,71,0.15);
        }

        /* ── Marquee ── */
        .marquee-track {
          display: flex;
          white-space: nowrap;
          animation: marquee-x 20s linear infinite;
        }
        @keyframes marquee-x {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* ── CTA: offset shadow on hover ── */
        .cta-primary { transition: transform 0.14s ease, box-shadow 0.14s ease; }
        .cta-primary:hover  { transform: translate(-3px,-3px); box-shadow: 3px 3px 0 0 #F0EDE6; }
        .cta-primary:active { transform: translate(0,0); box-shadow: none; }

        /* ── CTA ghost ── */
        .cta-ghost { transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease; }
        .cta-ghost:hover { background: #1E1E1E; color: #F0EDE6; border-color: #3A3A3A; }

        /* ── Social link ── */
        .social-link { transition: background 0.18s ease, color 0.18s ease; }
        .social-link:hover { background: #1A1A1A; color: #F0EDE6; }

        /* ── Tech tag ── */
        .tech-tag { transition: border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease; }
        .tech-tag:hover { border-color: #E8FF47; color: #E8FF47; box-shadow: 0 0 10px rgba(232,255,71,0.2); }
      `}</style>

      <section id="hero" className="brutal-grid relative min-h-screen overflow-hidden">

        <motion.header
          variants={fadeInVariants}
          initial="hidden"
          animate="show"
          transition={fadeTransition(0)}
          className="relative z-20 flex items-stretch border-b border-ca-rule"
        >
          <div className="flex items-center border-r border-ca-rule px-5 py-4">
            <span className="font-mono text-[0.6rem] tracking-[0.14em] text-ca-muted">001</span>
          </div>

          <div className="flex flex-1 items-center justify-center px-4 py-4">
            <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.28em] text-ca-muted">
              Charles Alcantara
            </span>
          </div>

          <div className="flex items-center gap-2.5 border-l border-ca-rule px-5 py-4">
            <span className="dot-glow inline-block h-2 w-2 rounded-full bg-ca-neon" />
            <span className="font-mono hidden text-[0.6rem] uppercase tracking-[0.18em] text-ca-muted md:block">
              Available
            </span>
          </div>
        </motion.header>


        <div className="relative z-10 grid min-h-[calc(100vh-53px)] grid-cols-1 md:grid-cols-[1fr_auto]">


          <div className="flex flex-col justify-between border-r border-ca-rule px-6 py-7 md:px-10 md:py-9 lg:px-14">

            {/* Portfolio / year row */}
            <motion.div
              variants={fadeInVariants}
              initial="hidden"
              animate="show"
              transition={fadeTransition(0.15)}
              className="flex items-center gap-4"
            >
              <span className="font-mono text-[0.56rem] uppercase tracking-[0.16em] text-ca-muted">Portfolio</span>
              <div className="h-px flex-1 bg-ca-rule" />
              <span className="font-mono text-[0.56rem] tracking-[0.16em] text-ca-muted">2026</span>
            </motion.div>

            {/* ── Headlines ── */}
            <div className="my-6 flex flex-1 flex-col justify-center gap-0">
              {headlines.map(({ text, outline, accent, delay }, i) => (
                <div key={i} className="overflow-hidden leading-none">
                  <motion.h1
                    variants={slideUpVariants}
                    initial="hidden"
                    animate="show"
                    transition={slideTransition(delay)}
                    className={[
                      "font-syne block select-none",
                      // Tighter on mobile, scales up — won't clip on small screens
                      "text-[clamp(2.2rem,7vw,7.5rem)]",
                      "font-extrabold leading-[0.9] tracking-[-0.03em]",
                      outline ? "text-outline-paper" : "",
                      accent  ? "text-ca-neon text-glow-neon" : "",
                      !outline && !accent ? "text-ca-paper" : "",
                    ].join(" ")}
                  >
                    {text}
                  </motion.h1>
                </div>
              ))}
            </div>

            <motion.div
              variants={fadeInVariants}
              initial="hidden"
              animate="show"
              transition={fadeTransition(0.85)}
              className="flex flex-col gap-5 border-t border-ca-rule pt-5 md:flex-row md:items-end md:justify-between"
            >
              <p className="font-jakarta max-w-[38ch] text-sm leading-relaxed text-slate-400/50">
                Full-stack developer &amp; UI/UX designer from the Philippines.
                Building products that are{" "}
                <span className="font-medium text-white">technically solid</span>
                {" "}and{" "}
                <span className="font-medium text-ca-neon">visually sharp.</span>
              </p>

              <div className="flex flex-shrink-0 items-center gap-3">
                <a
                  href="#projects"
                  className="cta-primary font-syne inline-flex items-center gap-2 bg-ca-neon px-5 py-2.5 text-[0.74rem] font-bold uppercase tracking-[0.1em] text-ca-bg"
                >
                  View Work
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                    <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a
                  href="#contact"
                  className="cta-ghost font-syne border border-ca-rule px-5 py-2.5 text-[0.74rem] font-bold uppercase tracking-[0.1em] text-ca-muted"
                >
                  Let's Talk
                </a>
              </div>
            </motion.div>
          </div>

          <motion.aside
            variants={fadeInVariants}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.9, delay: 0.35, ease: SPRING }}
            className="flex flex-col border-t border-ca-rule md:w-[260px] md:border-t-0 lg:w-[320px]"
          >

            <div className="photo-tint photo-vignette relative min-h-[280px] flex-1 overflow-hidden md:min-h-0">
              <Image
                src="/pictures/my-closeup.png"
                alt="Charles Alcantara"
                fill
                className="photo-img object-cover object-top"
                priority
              />

              {/* Corner triangle accent */}
              <div
                aria-hidden
                className="absolute right-0 top-0 z-10 h-14 w-14"
                style={{ background: "#FF2D6B", clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
              />

              {/* Caption */}
              <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
                <div className="h-px w-3 bg-ca-muted opacity-40" />
                <span className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-ca-muted opacity-60">
                  002 / Portrait
                </span>
              </div>
            </div>

            {/* Info panel */}
            <div className="border-t border-ca-rule">

              {/* Socials */}
              <div className="flex border-b border-ca-rule">
                {[
                  { label: "GH", href: "https://github.com/selrvk",                 title: "GitHub"    },
                  { label: "LI", href: "https://linkedin.com/in/charles-alcantara", title: "LinkedIn"  },
                  { label: "IG", href: "https://instagram.com/selrvk",              title: "Instagram" },
                ].map(({ label, href, title }, i) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={title}
                    className={[
                      "social-link flex flex-1 items-center justify-center py-3.5",
                      "font-mono text-[0.6rem] font-bold tracking-[0.18em] text-ca-muted",
                      i < 2 ? "border-r border-ca-rule" : "",
                    ].join(" ")}
                  >
                    {label}
                  </a>
                ))}
              </div>

              {/* Tags */}
              <div className="tag-panel px-5 py-4">
                <p className="font-mono mb-3 text-[0.54rem] uppercase tracking-[0.18em] text-ca-muted">
                  Role / Expertise
                </p>
                <div className="flex flex-wrap gap-1.5 ">
                  {["Next.js", "React", "TypeScript", "Node.js", "Figma", "UI/UX"].map((tag) => (
                    <span
                      key={tag}
                      className="tech-tag font-mono cursor-default border border-ca-rule px-2.5 py-1 text-[0.58rem] uppercase tracking-wider text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </motion.aside>
        </div>

        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          animate="show"
          transition={fadeTransition(1.3)}
          className="relative z-20 overflow-hidden border-t border-ca-rule bg-ca-bg py-2.5"
        >
          <div className="marquee-track">
            {Array(10).fill(null).map((_, i) => (
              <span key={i} className="mx-8 inline-flex items-center gap-8">
                <span className="font-syne text-[0.62rem] font-bold uppercase tracking-[0.22em] text-ca-rule">
                  Full-Stack Developer
                </span>
                <span className="text-[5px] text-ca-neon">◆</span>
                <span className="font-syne text-[0.62rem] font-bold uppercase tracking-[0.22em] text-ca-rule">
                  UI/UX Designer
                </span>
                <span className="text-[5px] text-ca-hot">◆</span>
                <span className="font-syne text-[0.62rem] font-bold uppercase tracking-[0.22em] text-ca-rule">
                  Charles Alcantara
                </span>
                <span className="text-[5px] text-ca-neon">◆</span>
              </span>
            ))}
          </div>
        </motion.div>

      </section>
    </>
  )
}