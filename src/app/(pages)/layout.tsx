import ContentWrapper from "@/components/content-wrapper";
import NavBar from "@/components/nav-bar";
import AsciiText from "@/components/text/ascii-text";
import ThemeSwitcher from "@/components/theme-switcher";
import Link from "next/link";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <>
            <div className="fixed w-[100vw] border-b-2 border-dark-0 dark:border-light-0 backdrop-blur-md z-10 py-1">
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
            <ContentWrapper className="pt-12">
                {children}
            </ContentWrapper>
        </>
    )
}
