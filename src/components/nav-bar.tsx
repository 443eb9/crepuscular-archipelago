"use client"

import Link from "next/link";
import ContentWrapper from "./content-wrapper";
import AsciiText from "./text/ascii-text";
import ThemeSwitcher from "./theme-switcher";
import NavBarButtons from "./nav-bar-buttons";
import { useRef, useState } from "react";
import { IoMenuSharp } from "react-icons/io5";
import * as motion from "motion/react-client";
import OutlinedBox from "./outlined-box";

export default function NavBar() {
    const [expanded, setExpanded] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    return (
        <>
            <motion.div className="fixed w-[100vw] py-1 flex items-center border-b-2 border-dark-0 dark:border-light-0 backdrop-blur-md z-10">
                <ContentWrapper className="justify-between items-center">
                    <div className="">
                        <AsciiText className="font-bold text-2xl hover:text-accent-0">
                            <Link href="/">
                                Crepuscular Archipelago
                            </Link>
                        </AsciiText>
                    </div>
                    <div className="hidden md:block relative">
                        <ThemeSwitcher className="md:absolute w-10 aspect-square md:-right-12" />
                        <div className="flex gap-2">
                            <NavBarButtons width={80} height={40} />
                        </div>
                    </div>
                    <div className="md:hidden flex mt-2 gap-1">
                        <IoMenuSharp
                            className={`text-4xl hover:text-accent-0 cursor-pointer ${expanded ? "text-accent-0" : "text-dark-0 dark:text-light-0"}`}
                            onClick={() => setExpanded(!expanded)}
                        />
                        <ThemeSwitcher />
                    </div>
                </ContentWrapper>
            </motion.div>
            <motion.div
                layout
                className="fixed md:hidden flex items-center self-center backdrop-blur-md z-10 min-h-14 w-full"
                style={{
                    bottom: bottomRef.current ? expanded ? 0 : `-${bottomRef.current.clientHeight}px` : "-100%",
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                ref={bottomRef}
            >
                <OutlinedBox className="flex flex-grow flex-wrap gap-2 py-1 px-2 -scale-y-100 border-x-0 border-t-0">
                    <NavBarButtons flipped width={80} height={40} />
                </OutlinedBox>
            </motion.div>
        </>
    )
}
