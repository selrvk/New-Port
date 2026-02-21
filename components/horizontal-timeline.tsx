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
            <div className="flex items-center justify-between min-w-max gap-8 md:gap-16 px-4">
              {education.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center relative group min-w-[220px] md:min-w-[280px]"
                >
                  {/* Circle / Milestone */}
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg z-10 transition-transform duration-300 group-hover:scale-110">
                    <GraduationCap className="w-8 h-8 md:w-10 md:h-10" />
                  </div>

                  {/* Connecting line (except last) */}
                  {index < education.length - 1 && (
                    <div className="absolute top-8 md:top-10 left-[calc(50%+40px)] md:left-[calc(50%+50px)] right-[-50%] md:right-[-100%] h-1 bg-gradient-to-r from-primary to-primary/40 hidden md:block" />
                  )}

                  {/* Content card below */}
                  <div className="mt-6 bg-card p-5 md:p-6 rounded-xl shadow-md border border-border w-full transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                    <h3 className="text-lg md:text-xl font-bold mb-1">{item.school}</h3>
                    {item.degree && (
                      <p className="text-sm md:text-base text-primary font-medium mb-2">
                        {item.degree}
                      </p>
                    )}
                    <p className="text-sm md:text-base text-muted-foreground">{item.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>    
        </div>
      </div>
    </section>
  );
}