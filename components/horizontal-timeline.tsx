"use client";

import { education } from "@/data/education";
import { GraduationCap } from "lucide-react"; // or any icon library

type EducationEntry = {
  year: string;
  school: string;
  degree?: string;
  description: string;
};

export default function HorizontalEducationTimeline() {
  return (
    <section className="">

      <div className="">

        {/* Horizontal container with scroll on mobile */}
        <div className="relative">
          <div className="overflow-x-auto pb-8 scrollbar-hide">
            <div className="flex items-start min-w-max px-4 pb-10">
              {education.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center relative group shrink-0 w-80 mx-8"
                >
                  {/* ICON WRAPPER (important) */}
                  <div className="relative flex items-center justify-center w-full">
                    
                    {/* Left half line (for all except first) */}
                    {index !== 0 && (
                      <div className="absolute -left-8 top-1/2 w-[calc(50%+2rem)] h-1 bg-amber-100 -translate-y-1/2" />
                    )}

                    {/* Right half line (for all except last) */}
                    {index !== education.length - 1 && (
                      <div className="absolute -right-8 top-1/2 w-[calc(50%+2rem)] h-1 bg-amber-100 -translate-y-1/2" />
                    )}

                    {/* Circle */}
                    <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                      <GraduationCap className="w-8 h-8 md:w-10 md:h-10" />
                    </div>
                  </div>

                  {/* Card */}
                  <div className="mt-10 border border-black bg-linear-to-t from-[#191E32] to-palette-four p-5 md:p-6 rounded-xl shadow-2xl/40 shadow-palette-one w-full transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                    <h3 className="text-lg md:text-xl font-bold mb-1 text-palette-two">
                      {item.school}
                    </h3>
                    {item.degree && (
                      <p className="text-sm md:text-base text-palette-one font-medium mb-2">
                        {item.degree}
                      </p>
                    )}
                    <p className="text-sm md:text-base text-muted-foreground">
                      {item.year}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>  

          <div className="md:hidden text-center text-sm text-muted-foreground mt-6 italic">
              ← Scroll horizontally to view all →
          </div>  
        </div>
      </div>
    </section>
  );
}