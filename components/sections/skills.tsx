

import { Button } from "@/components/ui/button"
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

    return (
        <section id="skills" className="relative min-h-screen overflow-hidden bg-linear-to-l from-[#1C2442] to-palette-four">
                    
                    <div className="flex flex-col items-center justify-center">
        
                        <div>
                            <h1 className="text-palette-one font-bebas text-6xl text-center mt-20">
                                Skills
                            </h1>
        
                            <h2 className="text-palette-two font-calistoga text-xl text-center -mt-3">
                                tech stack & practices
                            </h2>
                        </div>
        
                    </div>

                    <div className="flex justify-between mt-30 px-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="font-bold p-2 max-w-[30%] rounded-2xl text-sm text-palette-one bg-linear-to-t from-[#59607F] to-[#546197]">
                                Web Development
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="text-palette-one bg-transparent">    
                                <DropdownMenuGroup>
                                <DropdownMenuItem>Front End</DropdownMenuItem>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem>Back End</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Practices</DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger className="font-bold p-2 max-w-[30%] rounded-2xl text-sm text-palette-one bg-linear-to-t from-[#59607F] to-[#546197]">
                                Software Development
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="text-palette-one bg-transparent">
                                <DropdownMenuGroup>
                                <DropdownMenuItem>Desktop Apps</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Mobile Apps</DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger className="font-bold p-2 max-w-[30%] rounded-2xl text-sm text-palette-one bg-linear-to-t from-[#59607F] to-[#546197]">
                                Visual Graphic Design
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="text-palette-one bg-transparent">
                                <DropdownMenuGroup>
                                <DropdownMenuItem>Brand Identity</DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <h1 className="text-palette-one/50 text-center mt-40">
                        Web Development --- Front End
                    </h1>
        
        </section>
    )
}