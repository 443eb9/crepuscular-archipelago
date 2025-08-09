import ContentWrapper from "@/components/content-wrapper";
import NavBar from "@/components/nav-bar";
import AsciiText from "@/components/text/ascii-text";
import ThemeSwitcher from "@/components/theme-switcher";
import Link from "next/link";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col">
            <div className="fixed w-[100vw] h-12 flex items-center border-b-2 border-dark-0 dark:border-light-0 backdrop-blur-md z-10">
                <ContentWrapper className="justify-between items-center">
                    <div className="">
                        <AsciiText className="font-bold text-2xl hover:text-accent-0">
                            <Link href="/">
                                Crepuscular Archipelago
                            </Link>
                        </AsciiText>
                    </div>
                    <div className="relative">
                        <ThemeSwitcher className="absolute w-10 aspect-square -right-12" />
                        <NavBar />
                    </div>
                </ContentWrapper>
            </div >
            <ContentWrapper className="pt-14">
                {children}
            </ContentWrapper>
            <ContentWrapper className="mt-8 mb-16">
                <div className="flex flex-col w-full font-bender italic opacity-50 text-sm">
                    <AsciiText>
                        Copyright 2024-2025 443eb9#C. Articles and images are protected by their respective licenses.
                    </AsciiText>
                    <AsciiText>
                        Built using <Link target="_blank" className="underline" href="https://www.rust-lang.org/">Rust</Link> 🦀 and <Link target="_blank" className="underline" href="https://nextjs.org/">Next.js</Link> ▲, with <span className="text-accent-0">passion</span> and <span className="text-accent-1">love</span>.
                    </AsciiText>
                    <AsciiText>Source code published on <Link target="_blank" className="underline" href="https://github.com/443eb9/crepuscular-archipelago">Github</Link> under MIT license.</AsciiText>
                </div>
            </ContentWrapper>
        </div>
    )
}
