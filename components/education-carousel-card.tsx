import { RainbowButton } from "@/components/ui/rainbow-button"
import Image from "next/image"

type School = {
    id: number
    school: string
    seal: string
}

export default function EducationCarouselCard({ school }: { school: School }) {
  return (

    <div className="flex flex-col text-center items-center justify-center p-6 rounded-2xl shadow-2xl/40 shadow-palette-one bg-linear-to-t from-[#191E32] to-palette-four">

        <Image src="/pictures/De_La_Salle_University_Seal.svg" alt="Hero Image" width={100} height={300} 
                            className="" />
            <h2 className="text-xl font-bold font-calistoga text-palette-two">
                {school.school}
        </h2>
        
    </div>

  )
}