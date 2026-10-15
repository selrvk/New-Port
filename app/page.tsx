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
//
// Which layer a visitor gets is decided before first paint by an inline script
// (components/laptop/boot.ts), so a 3D visitor never sees layer 1 flash up first.

import Hero from "@/components/sections/hero";
import Projects from "@/components/sections/projects";
import Skills from "@/components/sections/skills";
import Certifications from "@/components/sections/certifications";
import Education from "@/components/sections/education";
import AboutMe from "@/components/sections/about-me";
import Languages from "@/components/sections/languages";
import Contact from "@/components/sections/contact";

import { Chrome } from "@/components/keys/Chrome";
import { KeysFooter } from "@/components/keys/KeysFooter";
import { DomActivityProvider } from "@/components/portfolio-dom/DomActivity";
import { LaptopExperienceLoader } from "@/components/laptop/LaptopExperienceLoader";
import { BootScreen } from "@/components/laptop/BootScreen";

export default function Home() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {/* Invisible unless the boot script chose 3D — see components/laptop/boot.ts. */}
      <BootScreen />

      <LaptopExperienceLoader />

      {/* Layer 1 — "Keystrokes": the laptop's keyboard (app/keys.css). Everything
          the 3D layer hides lives inside data-portfolio-dom, the function row and
          footer included. DomActivityProvider lets it stand its listeners and
          animation loops down while covered.
          <main> takes tabIndex -1 so "Skip to content" can move focus into it; in
          3D mode, focus arriving anywhere in this layer is what reveals it — see
          LaptopExperience. */}
      <div className="keys" data-portfolio-dom>
        <DomActivityProvider>
          <Chrome />
          <main id="main" tabIndex={-1}>
            <Hero />
            <Projects />
            <Skills />
            <Certifications />
            <Education />
            <AboutMe />
            <Languages />
            <Contact />
          </main>
          <KeysFooter />
        </DomActivityProvider>
      </div>
    </>
  );
}
