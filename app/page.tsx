// app/page.tsx
//
// Two layers, in this order:
//
//   1. The semantic portfolio — server-rendered, crawlable, keyboard-navigable,
//      and the complete experience on its own. This is the baseline.
//   2. The 3D presentation — client-only, lazily loaded, and purely additive. When
//      it runs it visually hides layer 1 (see [data-laptop="on"] in globals.css);
//      the content stays in the DOM and in source order for crawlers and AT.
//
// Anything that stops layer 2 — no JS, no WebGL, prefers-reduced-motion, a narrow
// viewport, or a load failure — simply leaves layer 1 visible.

import Hero from "@/components/sections/hero";
import Projects from "@/components/sections/projects";
import Skills from "@/components/sections/skills";
import Certifications from "@/components/sections/certifications";
import Education from "@/components/sections/education";
import AboutMe from "@/components/sections/about-me";
import Languages from "@/components/sections/languages";
import Contact from "@/components/sections/contact";

import { DomActivityProvider } from "@/components/portfolio-dom/DomActivity";
import { LaptopExperienceLoader } from "@/components/laptop/LaptopExperienceLoader";

export default function Home() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <LaptopExperienceLoader />

      {/* Wrapped so this tree can stand its timers and animation loops down while
          the 3D layer is covering it. The markup is identical either way. */}
      <main id="main" data-portfolio-dom>
        <DomActivityProvider>
          <Hero />
          <Projects />
          <Skills />
          <Certifications />
          <Education />
          <AboutMe />
          <Languages />
          <Contact />
        </DomActivityProvider>
      </main>
    </>
  );
}
