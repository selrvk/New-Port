import { RainbowButton } from "@/components/ui/rainbow-button"

type Project = {
    title: string
    description: string
    image: string
    demo: string
    source: string
}

export default function CarouselCard({ project }: { project: Project }) {
  return (

    <div className="flex flex-col text-center items-center justify-center p-6 rounded-2xl shadow-2xl/40 shadow-palette-one bg-linear-to-t from-[#191E32] to-palette-four">

        <img src={project.image} alt={project.title} className="w-80 mb-4" />
            <h2 className="text-3xl font-bold font-calistoga text-palette-two">
                {project.title}
            </h2>
        <p className="text-center max-w-md font-vietnam text-palette-one mt-5">
            {project.description}
        </p>
        
        <div className="flex gap-10 mt-10">
            <RainbowButton variant="outline" className="font-bold" size="sm" asChild>
                <a href={project.demo} target="_blank" rel="noopener noreferrer">Live Demo</a>
            </RainbowButton>
            <RainbowButton variant="outline" className="font-bold " size="sm" asChild>
                <a href={project.source} target="_blank" rel="noopener noreferrer">Source Code</a>
            </RainbowButton>
        </div>
        

    </div>

  )
}