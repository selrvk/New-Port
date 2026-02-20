import EducationCarousel from "@/components/education-carousel";

export default function Education() {

    return (
        <section id="education" className="relative min-h-screen overflow-hidden bg-linear-to-l from-[#1C2442] to-palette-four">
                    
                    <div className="flex flex-col items-center justify-center">
        
                        <div>
                            <h1 className="text-palette-one font-bebas text-6xl text-center mt-20">
                                Education
                            </h1>
        
                            <h2 className="text-palette-two font-calistoga text-xl text-center -mt-3">
                                what brought me here
                            </h2>
                        </div>
                        
                        <EducationCarousel />
                        
                    </div>
        
        </section>
    )
}