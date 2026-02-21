"use client"

import { AnimatePresence,motion } from "motion/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { skillsData } from "@/data/skills"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Skills() {

    const [selectedSkill, setSelectedSkill] = useState({
        category: "Web Development",
        type: "Front End",
    });

    return (
        <section id="skills" className="pb-40 relative min-h-screen bg-linear-to-l from-[#1C2442] to-palette-four">
                    
                    <div className="flex flex-col items-center justify-center">
        
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}   
                            whileInView={{ opacity: 1, y: 0 }} 
                            viewport={{ once: false, amount: 0.5 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                        >
                            <h1 className="text-palette-one font-bebas text-6xl text-center mt-20">
                                Skills
                            </h1>
        
                            <h2 className="text-palette-two font-calistoga text-xl text-center -mt-3">
                                tech stack & practices
                            </h2>
                        </motion.div>
        
                    </div>

                    <motion.div
                            initial={{ opacity: 0, y: 20 }}   
                            whileInView={{ opacity: 1, y: 0 }} 
                            viewport={{ once: false, amount: 0.2 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="sticky top-0 z-40 flex justify-between mt-30 px-3 py-4 
                                        bg-linear-to-l from-[#1C2442] to-palette-four">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="font-bold p-2 max-w-[30%] rounded-2xl text-sm text-palette-one bg-linear-to-t from-[#59607F] to-[#546197]">
                                Web Development
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="text-palette-one bg-linear-to-t from-[#59607F] to-[#546197]">    
                                <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() =>
                                        setSelectedSkill({ category: "Web Development", type: "Front End" })}>
                                        Front End
                                    </DropdownMenuItem>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem onClick={() =>
                                        setSelectedSkill({ category: "Web Development", type: "Back End" })}>
                                        Back End
                                    </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() =>
                                        setSelectedSkill({ category: "Web Development", type: "Practices" })}>
                                        Practices
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger className="font-bold p-2 max-w-[30%] rounded-2xl text-sm text-palette-one bg-linear-to-t from-[#59607F] to-[#546197]">
                                Software Development
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="text-palette-one bg-linear-to-t from-[#59607F] to-[#546197]">
                                <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() =>
                                    setSelectedSkill({ category: "Software Development", type: "Desktop Apps" })
                                }>Desktop Apps</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() =>
                                    setSelectedSkill({ category: "Software Development", type: "Mobile Apps" })
                                }>Mobile Apps</DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger className="font-bold p-2 max-w-[30%] rounded-2xl text-sm text-palette-one bg-linear-to-t from-[#59607F] to-[#546197]">
                                Visual Graphic Design
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="text-palette-one bg-linear-to-t from-[#59607F] to-[#546197]">
                                <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() =>
                                    setSelectedSkill({ category: "Visual Graphic Design", type: "Brand Identity" })
                                }>Brand Identity</DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </motion.div>

                    <h1 className="text-palette-one/50 text-center mt-40">
                        {selectedSkill.category} → {selectedSkill.type}
                    </h1>
                    
                    <AnimatePresence mode="wait">
                    <motion.div 

                        key={`${selectedSkill.category}-${selectedSkill.type}`}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    
                    id="skills-showcase-card" className="flex justify-center mt-10 gap-5 w-[80%] mx-auto border border-black shadow-xl/20 shadow-palette-one bg-linear-to-t from-[#101425] to-palette-four p-5 rounded-2xl">
                        <div className="flex flex-col items-center gap-3 pb-5">
                            <h2 className="text-palette-two font-bold text-4xl font-bebas mt-5">
                                {selectedSkill.type}
                            </h2>
                            <ul className="mt-5 space-y-5">
                                {skillsData[selectedSkill.category][selectedSkill.type].map((skill : string)=> (
                                    <SkillItem key={skill} text={skill} />
                                ))} 
                            </ul>
                        </div>
                    </motion.div>
                    </AnimatePresence>
        
        </section>
    )
}

function SkillItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="text-purple-500 mt-1 text-3xl leading-none">•</span>
      <span className="text-palette-one">{text}</span>
    </li>
  )
}