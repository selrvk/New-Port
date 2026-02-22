import { RainbowButton } from "@/components/ui/rainbow-button"
import LogoLoop from "./LogoLoop";
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiPhp, SiHtml5, SiCss3, SiNodedotjs, SiSupabase} from 'react-icons/si';

type Project = {
    title: string
    description: string
    image: string
    stack: string[]
    demo: string
    source: string
}

const techLogos = [
  { node: <SiReact className="text-palette-one/50"/>, title: "React", href: "https://react.dev"},
  { node: <SiNextdotjs className="text-palette-one/50"/>, title: "Next.js", href: "https://nextjs.org" },
  { node: <SiTypescript className="text-palette-one/50"/>, title: "TypeScript", href: "https://www.typescriptlang.org" },
  { node: <SiTailwindcss className="text-palette-one/50"/>, title: "Tailwind CSS", href: "https://tailwindcss.com" },
  { node: <SiPhp className="text-palette-one/50"/>, title: "Php", href: "https://php.net" },
  { node: <SiCss3 className="text-palette-one/50"/>, title: "CSS3", href: "https://www.w3schools.com/css/" },
  { node: <SiHtml5 className="text-palette-one/50"/>, title: "HTML5", href: "https://www.w3schools.com/html/" },
  { node: <SiNodedotjs className="text-palette-one/50"/>, title: "NodeJS", href: "https://nodejs.org/en" },
  { node: <SiSupabase className="text-palette-one/50"/>, title: "Supabase", href: "https://supabase.com/"},
];

export default function CarouselCard({ project }: { project: Project }) {

    const filteredLogos = techLogos.filter((logo) =>
        project.stack.includes(logo.title)
    )

  return (

    <div className="flex flex-col text-center items-center justify-center p-6 rounded-2xl  shadow-2xl/40 shadow-palette-one bg-linear-to-t from-[#191E32] to-palette-four">

        <img src={project.image} alt={project.title} className="w-80 mb-4" />
            <h2 className="text-3xl font-bold font-calistoga text-palette-two">
                {project.title}
            </h2>
        <p className="text-center max-w-md font-vietnam text-palette-one mt-5">
            {project.description}
        </p>
        
        <div className="flex gap-10 mt-10">
            <RainbowButton variant="outline" className="font-bold transition-transform duration-300 hover:scale-120" size="sm" asChild>
                <a href={project.demo} target="_blank" rel="noopener noreferrer">Live Demo</a>
            </RainbowButton>
            <RainbowButton variant="outline" className="font-bold transition-transform duration-300 hover:scale-120" size="sm" asChild>
                <a href={project.source} target="_blank" rel="noopener noreferrer">Source Code</a>
            </RainbowButton>
        </div>

        {filteredLogos.length > 0 && (
          <div className="mt-5 max-w-60">
            <LogoLoop
              logos={filteredLogos}
              speed={20}
              direction="left"
              logoHeight={36}
              gap={32}
              hoverSpeed={0}
              scaleOnHover
              fadeOut
              fadeOutColor="#191E32"
              ariaLabel="Skills Used"
            />
          </div>
        )}
        

    </div>

  )
}